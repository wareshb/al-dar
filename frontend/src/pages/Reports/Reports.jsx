import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Select, Button, Space, message, Tabs, Tag } from 'antd';
import {
    FileTextOutlined,
    PrinterOutlined,
    FilterOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
import { getGeneralReport, getAttendanceReport, getStaffAttendanceReport } from '../../services/reportService';
import { getStudents } from '../../services/studentService';
import { getHalaqat } from '../../services/halaqaService';
import { getTeachers } from '../../services/teacherService';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [staffAttendanceData, setStaffAttendanceData] = useState([]);
    const [dates, setDates] = useState([dayjs().startOf('month'), dayjs()]);
    const [activeTab, setActiveTab] = useState('general');

    // Filter states
    const [students, setStudents] = useState([]);
    const [halaqat, setHalaqat] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    useEffect(() => {
        loadFiltersData();
    }, []);

    useEffect(() => {
        if (activeTab === 'general') {
            loadReport();
        } else if (activeTab === 'attendance') {
            loadAttendance();
        } else if (activeTab === 'staff-attendance') {
            loadStaffAttendance();
        }
    }, [activeTab]);

    const loadFiltersData = async () => {
        try {
            const [studentsResult, halaqatResult, teachersResult] = await Promise.all([
                getStudents(),
                getHalaqat(),
                getTeachers()
            ]);

            if (studentsResult.success) {
                setStudents(studentsResult.data);
            }
            if (halaqatResult.success) {
                setHalaqat(halaqatResult.data);
            }
            if (teachersResult.success) {
                setTeachers(teachersResult.data);
            }
        } catch (error) {
            console.error('Error loading filter data:', error);
        }
    };

    const loadStaffAttendance = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dates[0].format('YYYY-MM-DD'),
                end_date: dates[1].format('YYYY-MM-DD')
            };

            if (selectedTeacher) {
                params.teacher_id = selectedTeacher;
            }

            const result = await getStaffAttendanceReport(params);
            if (result.success) {
                setStaffAttendanceData(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل تقرير حضور الموظفين');
        } finally {
            setLoading(false);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            };
            const result = await getGeneralReport(params);
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل التقرير العام');
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: dates[0].format('YYYY-MM-DD'),
                end_date: dates[1].format('YYYY-MM-DD')
            };

            // Add filters if selected
            if (selectedStudent) {
                params.student_id = selectedStudent;
            }
            if (selectedHalaqa) {
                params.halaqa_id = selectedHalaqa;
            }

            const result = await getAttendanceReport(params);
            if (result.success) {
                setAttendanceData(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل تقرير الحضور');
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setSelectedStudent(null);
        setSelectedHalaqa(null);
        setSelectedTeacher(null);
    };

    const handleRefresh = () => {
        if (activeTab === 'general') {
            loadReport();
        } else if (activeTab === 'attendance') {
            loadAttendance();
        } else if (activeTab === 'staff-attendance') {
            loadStaffAttendance();
        }
    };

    const exportToExcel = () => {
        if (!attendanceData || attendanceData.length === 0) {
            message.warning('لا توجد بيانات للتصدير');
            return;
        }

        const exportData = attendanceData.map(item => ({
            'اسم الطالب': item.student_name,
            'الحلقة': item.halaqa_name,
            'إجمالي الأيام': item.total_days,
            'أيام الحضور': item.present_days,
            'أيام الغياب': item.absent_days,
            'نسبة الحضور': `${item.attendance_percentage}%`
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تقرير الحضور");

        // RTL
        if (!wb.Workbook) wb.Workbook = {};
        if (!wb.Workbook.Views) wb.Workbook.Views = [];
        if (!wb.Workbook.Views[0]) wb.Workbook.Views[0] = {};
        wb.Workbook.Views[0].RTL = true;

        XLSX.writeFile(wb, `تقرير_حضور_الطلاب_${dates[0].format('YYYY-MM-DD')}.xlsx`);
    };

    const exportStaffToExcel = () => {
        if (!staffAttendanceData || staffAttendanceData.length === 0) {
            message.warning('لا توجد بيانات للتصدير');
            return;
        }

        const exportData = staffAttendanceData.map(item => ({
            'اسم الموظف': item.teacher_name,
            'نوع الموظف': item.staff_type === 'teacher' ? 'معلم' : item.staff_type === 'admin' ? 'إداري' : 'معلم وإداري',
            'إجمالي الأيام': item.total_days,
            'حاضر': item.present_days,
            'غائب': item.absent_days,
            'متأخر': item.late_days,
            'إجازة مرضية': item.sick_leave_days,
            'إجازة': item.vacation_days,
            'نسبة الانضباط': `${item.attendance_percentage}%`
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "تقرير حضور الموظفين");

        // RTL
        if (!wb.Workbook) wb.Workbook = {};
        if (!wb.Workbook.Views) wb.Workbook.Views = [];
        if (!wb.Workbook.Views[0]) wb.Workbook.Views[0] = {};
        wb.Workbook.Views[0].RTL = true;

        XLSX.writeFile(wb, `تقرير_حضور_الموظفين_${dates[0].format('YYYY-MM-DD')}.xlsx`);
    };

    const staffAttendanceColumns = [
        {
            title: 'اسم الموظف',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            sorter: (a, b) => a.teacher_name.localeCompare(b.teacher_name)
        },
        {
            title: 'النوع',
            dataIndex: 'staff_type',
            key: 'staff_type',
            render: (type) => {
                const map = { teacher: 'معلم', admin: 'إداري', both: 'معلم وإداري' };
                return <Tag>{map[type] || type}</Tag>;
            }
        },
        { title: 'إجمالي الأيام', dataIndex: 'total_days', key: 'total_days', align: 'center' },
        { title: 'حاضر', dataIndex: 'present_days', key: 'present_days', align: 'center', render: (val) => <Tag color="green">{val}</Tag> },
        { title: 'غائب', dataIndex: 'absent_days', key: 'absent_days', align: 'center', render: (val) => <Tag color="red">{val}</Tag> },
        { title: 'متأخر', dataIndex: 'late_days', key: 'late_days', align: 'center', render: (val) => <Tag color="orange">{val}</Tag> },
        { title: 'مرضية', dataIndex: 'sick_leave_days', key: 'sick_leave_days', align: 'center', render: (val) => <Tag color="purple">{val}</Tag> },
        { title: 'إجازة', dataIndex: 'vacation_days', key: 'vacation_days', align: 'center', render: (val) => <Tag color="blue">{val}</Tag> },
        {
            title: 'النسبة',
            dataIndex: 'attendance_percentage',
            key: 'attendance_percentage',
            align: 'center',
            render: (val) => (
                <Tag color={val >= 80 ? 'green' : val >= 50 ? 'orange' : 'red'}>
                    {val}%
                </Tag>
            ),
            sorter: (a, b) => a.attendance_percentage - b.attendance_percentage
        },
    ];

    const attendanceColumns = [
        {
            title: 'اسم الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
            sorter: (a, b) => a.student_name.localeCompare(b.student_name)
        },
        { title: 'الحلقة', dataIndex: 'halaqa_name', key: 'halaqa_name' },
        {
            title: 'إجمالي الأيام',
            dataIndex: 'total_days',
            key: 'total_days',
            align: 'center'
        },
        {
            title: 'حضور',
            dataIndex: 'present_days',
            key: 'present_days',
            align: 'center',
            render: (val) => <Tag color="green">{val}</Tag>
        },
        {
            title: 'غياب',
            dataIndex: 'absent_days',
            key: 'absent_days',
            align: 'center',
            render: (val) => <Tag color="red">{val}</Tag>
        },
        {
            title: 'نسبة الحضور',
            dataIndex: 'attendance_percentage',
            key: 'attendance_percentage',
            align: 'center',
            render: (val) => (
                <Tag color={val >= 80 ? 'blue' : val >= 50 ? 'orange' : 'magenta'}>
                    {val}%
                </Tag>
            ),
            sorter: (a, b) => a.attendance_percentage - b.attendance_percentage
        },
    ];

    const items = [
        {
            key: 'general',
            label: 'التقرير العام',
            children: (
                <>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                            <Card size="small" bordered={false} style={{ background: '#f6ffed' }}>
                                <Statistic
                                    title="إجمالي الحفظ"
                                    value={data?.totalMemorization || 0}
                                    suffix="سجل"
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card size="small" bordered={false} style={{ background: '#e6f7ff' }}>
                                <Statistic
                                    title="إجمالي المراجعة"
                                    value={data?.totalReview || 0}
                                    suffix="سجل"
                                    valueStyle={{ color: '#096dd9' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card size="small" bordered={false} style={{ background: '#fff7e6' }}>
                                <Statistic
                                    title="نسبة الانضباط العامة"
                                    value={data?.attendanceRate || 0}
                                    suffix="%"
                                    precision={1}
                                    valueStyle={{ color: '#d46b08' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <div style={{ marginTop: 24 }}>
                        <h3 style={{ marginBottom: 16 }}>أكثر الطلاب إنجازاً</h3>
                        <Table
                            dataSource={data?.topStudents || []}
                            rowKey="student_id"
                            columns={[
                                { title: 'اسم الطالب', dataIndex: 'full_name', key: 'full_name' },
                                { title: 'عدد الأسطر/الصفحات', dataIndex: 'total_achievement', key: 'total_achievement', align: 'center' },
                                { title: 'متوسط التقييم', dataIndex: 'avg_rating', key: 'avg_rating', align: 'center', render: (val) => val?.toFixed(1) },
                            ]}
                            pagination={false}
                            loading={loading}
                            scroll={{ x: 'max-content' }}
                        />
                    </div>
                </>
            )
        },
        {
            key: 'attendance',
            label: 'تقرير الحضور والغياب',
            children: (
                <div style={{ marginTop: 8 }}>
                    {/* Filter Controls */}
                    <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                        <Space wrap>
                            <Select
                                placeholder="اختر طالب"
                                style={{ width: 200 }}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                value={selectedStudent}
                                onChange={setSelectedStudent}
                            >
                                {students.map(student => (
                                    <Option key={student.id} value={student.id}>
                                        {student.full_name}
                                    </Option>
                                ))}
                            </Select>

                            <Select
                                placeholder="اختر حلقة"
                                style={{ width: 200 }}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                value={selectedHalaqa}
                                onChange={setSelectedHalaqa}
                            >
                                {halaqat.map(halaqa => (
                                    <Option key={halaqa.id} value={halaqa.id}>
                                        {halaqa.name}
                                    </Option>
                                ))}
                            </Select>

                            <Button
                                onClick={handleClearFilters}
                                disabled={!selectedStudent && !selectedHalaqa}
                            >
                                مسح الفلاتر
                            </Button>

                            <Button
                                type="primary"
                                icon={<FilterOutlined />}
                                onClick={loadAttendance}
                            >
                                تطبيق الفلتر
                            </Button>
                        </Space>
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>تفاصيل الحضور والغياب للطلاب</h3>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={exportToExcel}
                            style={{ backgroundColor: '#217346', color: 'white' }}
                        >
                            تصدير إلى Excel
                        </Button>
                    </div>
                    <Table
                        dataSource={attendanceData}
                        rowKey="student_id"
                        columns={attendanceColumns}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            )
        },
        {
            key: 'staff-attendance',
            label: 'حضور المعلمين والموظفين',
            children: (
                <div style={{ marginTop: 8 }}>
                    <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
                        <Space wrap>
                            <Select
                                placeholder="اختر موظف"
                                style={{ width: 250 }}
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().includes(input.toLowerCase())
                                }
                                value={selectedTeacher}
                                onChange={setSelectedTeacher}
                            >
                                {teachers.map(t => (
                                    <Option key={t.id} value={t.id}>
                                        {t.full_name} ({t.staff_type === 'teacher' ? 'معلم' : 'إداري'})
                                    </Option>
                                ))}
                            </Select>

                            <Button
                                onClick={handleClearFilters}
                                disabled={!selectedTeacher}
                            >
                                مسح الفلاتر
                            </Button>

                            <Button
                                type="primary"
                                icon={<FilterOutlined />}
                                onClick={loadStaffAttendance}
                            >
                                تطبيق الفلتر
                            </Button>
                        </Space>
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>تفاصيل حضور المعلمين والموظفين</h3>
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={exportStaffToExcel}
                            style={{ backgroundColor: '#217346', color: 'white' }}
                        >
                            تصدير إلى Excel
                        </Button>
                    </div>
                    <Table
                        dataSource={staffAttendanceData}
                        rowKey="teacher_id"
                        columns={staffAttendanceColumns}
                        loading={loading}
                        scroll={{ x: 'max-content' }}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            )
        }
    ];

    return (
        <Card title="التقارير والإحصائيات" className="reports-card">
            <Space style={{ marginBottom: 24 }} wrap>
                <RangePicker
                    value={dates}
                    onChange={setDates}
                    placeholder={['تاريخ البداية', 'تاريخ النهاية']}
                />
                <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={handleRefresh}
                    loading={loading}
                >
                    تحديث البيانات
                </Button>
                <Button
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                >
                    طباعة
                </Button>
            </Space>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                type="card"
            />
        </Card>
    );
};

export default Reports;
