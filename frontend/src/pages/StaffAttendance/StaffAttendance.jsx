import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Card,
    DatePicker,
    message,
    Radio,
    Tag,
    Statistic,
    Row,
    Col,
    Input,
    TimePicker,
    Tooltip,
    Typography,
    Badge,
    Grid
} from 'antd';
import {
    SaveOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { getStaffAttendanceByDate, recordStaffAttendance } from '../../services/staffAttendanceService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;

const StaffAttendance = () => {
    const [date, setDate] = useState(dayjs());
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        sick_leave: 0,
        vacation: 0
    });
    const [expandedRows, setExpandedRows] = useState({});
    const screens = Grid.useBreakpoint();

    useEffect(() => {
        loadAttendance();
    }, []);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const result = await getStaffAttendanceByDate(date.format('YYYY-MM-DD'));
            if (result.success) {
                setStaff(result.data);
                setStats(result.stats || {
                    total: result.data.length,
                    present: result.data.filter(s => s.status === 'present').length,
                    absent: result.data.filter(s => s.status === 'absent').length,
                    late: result.data.filter(s => s.status === 'late').length,
                    excused: result.data.filter(s => s.status === 'excused').length,
                    sick_leave: result.data.filter(s => s.status === 'sick_leave').length,
                    vacation: result.data.filter(s => s.status === 'vacation').length
                });
            }
        } catch (error) {
            message.error('خطأ في تحميل كشف الحضور');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (teacherId, status) => {
        setStaff(prev => prev.map(s => {
            if (s.teacher_id === teacherId) {
                const updated = { ...s, status };
                // إذا تم تغيير الحالة إلى حاضر، اضبط الوقت تلقائياً
                if (status === 'present' && !s.check_in_time) {
                    updated.check_in_time = dayjs().format('HH:mm:ss');
                }
                return updated;
            }
            return s;
        }));
        updateStats();
    };

    const handleTimeChange = (teacherId, field, time) => {
        setStaff(prev => prev.map(s =>
            s.teacher_id === teacherId
                ? { ...s, [field]: time ? time.format('HH:mm:ss') : null }
                : s
        ));
    };

    const handleNotesChange = (teacherId, notes) => {
        setStaff(prev => prev.map(s =>
            s.teacher_id === teacherId ? { ...s, notes } : s
        ));
    };

    const updateStats = () => {
        const newStats = {
            total: staff.length,
            present: staff.filter(s => s.status === 'present').length,
            absent: staff.filter(s => s.status === 'absent').length,
            late: staff.filter(s => s.status === 'late').length,
            excused: staff.filter(s => s.status === 'excused').length,
            sick_leave: staff.filter(s => s.status === 'sick_leave').length,
            vacation: staff.filter(s => s.status === 'vacation').length
        };
        setStats(newStats);
    };

    useEffect(() => {
        updateStats();
    }, [staff]);

    const handleSave = async () => {
        if (staff.length === 0) {
            message.warning('لا يوجد معلمين/موظفين لحفظ الحضور');
            return;
        }

        setSaving(true);
        try {
            const attendanceRecords = staff.map(s => ({
                attendance_id: s.attendance_id || null,
                teacher_id: s.teacher_id,
                status: s.status,
                check_in_time: s.check_in_time || null,
                check_out_time: s.check_out_time || null,
                notes: s.notes || ''
            }));

            const result = await recordStaffAttendance({
                attendance_date: date.format('YYYY-MM-DD'),
                records: attendanceRecords
            });

            if (result.success) {
                message.success('تم حفظ الحضور بنجاح');
                loadAttendance();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'خطأ في حفظ الحضور');
        } finally {
            setSaving(false);
        }
    };

    const getStaffTypeTag = (type) => {
        const types = {
            teacher: { text: 'معلم', color: 'blue' },
            admin: { text: 'إداري', color: 'green' },
            both: { text: 'معلم وإداري', color: 'purple' },
            worker: { text: 'موظف عادي', color: 'cyan' }
        };
        const typeInfo = types[type] || { text: type, color: 'default' };
        return <Tag color={typeInfo.color}>{typeInfo.text}</Tag>;
    };

    const toggleRowExpand = (teacherId) => {
        setExpandedRows(prev => ({
            ...prev,
            [teacherId]: !prev[teacherId]
        }));
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            render: (_, __, index) => index + 1,
        },
        {
            title: 'الاسم',
            title: 'الاسم',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            fixed: screens.md ? 'left' : undefined,
            width: 200,
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'النوع',
            dataIndex: 'staff_type',
            key: 'staff_type',
            width: 120,
            render: (type) => getStaffTypeTag(type),
        },
        {
            title: 'الحالة',
            key: 'status',
            width: 450,
            render: (_, record) => (
                <Radio.Group
                    value={record.status}
                    onChange={(e) => handleStatusChange(record.teacher_id, e.target.value)}
                    buttonStyle="solid"
                    size="small"
                >
                    <Radio.Button value="present">
                        <CheckCircleOutlined /> حاضر
                    </Radio.Button>
                    <Radio.Button value="absent">
                        <CloseCircleOutlined /> غائب
                    </Radio.Button>
                    <Radio.Button value="late">
                        <ClockCircleOutlined /> متأخر
                    </Radio.Button>
                    <Radio.Button value="excused">
                        <FileTextOutlined /> معذور
                    </Radio.Button>
                    <Radio.Button value="sick_leave">
                        <MedicineBoxOutlined /> إجازة مرضية
                    </Radio.Button>
                    <Radio.Button value="vacation">
                        <CalendarOutlined /> إجازة
                    </Radio.Button>
                </Radio.Group>
            ),
        },
        {
            title: 'وقت الدخول',
            key: 'check_in_time',
            width: 150,
            render: (_, record) => (
                <TimePicker
                    value={record.check_in_time ? dayjs(record.check_in_time, 'HH:mm:ss') : null}
                    onChange={(time) => handleTimeChange(record.teacher_id, 'check_in_time', time)}
                    format="HH:mm"
                    size="small"
                    placeholder="وقت الدخول"
                    style={{ width: '100%' }}
                    disabled={['absent', 'sick_leave', 'vacation'].includes(record.status)}
                />
            ),
        },
        {
            title: 'وقت الخروج',
            key: 'check_out_time',
            width: 150,
            render: (_, record) => (
                <TimePicker
                    value={record.check_out_time ? dayjs(record.check_out_time, 'HH:mm:ss') : null}
                    onChange={(time) => handleTimeChange(record.teacher_id, 'check_out_time', time)}
                    format="HH:mm"
                    size="small"
                    placeholder="وقت الخروج"
                    style={{ width: '100%' }}
                    disabled={['absent', 'sick_leave', 'vacation'].includes(record.status)}
                />
            ),
        },
        {
            title: 'ملاحظات',
            key: 'notes',
            width: 200,
            render: (_, record) => (
                <Tooltip title={record.notes || 'اضغط لإضافة ملاحظات'}>
                    <Button
                        type="text"
                        icon={<FileTextOutlined />}
                        onClick={() => toggleRowExpand(record.teacher_id)}
                        size="small"
                    >
                        {record.notes ? 'ملاحظات' : 'إضافة ملاحظة'}
                    </Button>
                </Tooltip>
            ),
        },
    ];

    const expandedRowRender = (record) => {
        return (
            <div style={{ padding: '16px', background: '#fafafa' }}>
                <Text strong>ملاحظات:</Text>
                <TextArea
                    value={record.notes || ''}
                    onChange={(e) => handleNotesChange(record.teacher_id, e.target.value)}
                    placeholder="أدخل ملاحظات حول حضور المعلم/الموظف..."
                    rows={3}
                    style={{ marginTop: 8 }}
                />
                {record.phone && (
                    <div style={{ marginTop: 12 }}>
                        <Text type="secondary">رقم الهاتف: {record.phone}</Text>
                    </div>
                )}
                {record.recorder_name && (
                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary">تم التسجيل بواسطة: {record.recorder_name}</Text>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2} style={{ marginBottom: 24 }}>
                    تسجيل حضور المعلمين والموظفين
                </Title>

                {/* الفلترة */}
                <Card size="small" style={{ marginBottom: 24, background: '#fafafa' }}>
                    <Space size="large" wrap direction={screens.md ? 'horizontal' : 'vertical'} style={{ width: screens.md ? 'auto' : '100%' }}>
                        <Space direction={screens.md ? 'horizontal' : 'vertical'} style={{ width: screens.md ? 'auto' : '100%' }}>
                            <Text strong style={{ whiteSpace: 'nowrap' }}>التاريخ:</Text>
                            <DatePicker
                                value={date}
                                onChange={(newDate) => {
                                    setDate(newDate);
                                    setStaff([]);
                                }}
                                allowClear={false}
                                format="YYYY-MM-DD"
                                style={{ width: screens.md ? 200 : '100%' }}
                            />
                        </Space>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={loadAttendance}
                            size="large"
                        >
                            تحميل كشف الحضور
                        </Button>
                    </Space>
                </Card>

                {/* الإحصائيات */}
                {staff.length > 0 && (
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="الإجمالي"
                                    value={stats.total}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="حاضر"
                                    value={stats.present}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="غائب"
                                    value={stats.absent}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="متأخر"
                                    value={stats.late}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="إجازة مرضية"
                                    value={stats.sick_leave}
                                    prefix={<MedicineBoxOutlined />}
                                    valueStyle={{ color: '#eb2f96' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6} lg={4}>
                            <Card>
                                <Statistic
                                    title="إجازة"
                                    value={stats.vacation}
                                    prefix={<CalendarOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* زر الحفظ أعلى الجدول */}
                {staff.length > 0 && (
                    <div style={{ marginBottom: 16, textAlign: 'left' }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SaveOutlined />}
                            loading={saving}
                            onClick={handleSave}
                            style={{ minWidth: 200, height: 40, fontSize: 14 }}
                        >
                            حفظ جميع السجلات
                        </Button>
                    </div>
                )}

                {/* جدول الحضور */}
                <Card>
                    <Table
                        columns={columns}
                        dataSource={staff}
                        rowKey="teacher_id"
                        loading={loading}
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showTotal: (total) => `إجمالي ${total} معلم/موظف`,
                        }}
                        scroll={{ x: screens.md ? 1400 : 'max-content' }}
                        expandable={{
                            expandedRowRender,
                            expandedRowKeys: Object.keys(expandedRows).filter(key => expandedRows[key]),
                            onExpand: (expanded, record) => {
                                toggleRowExpand(record.teacher_id);
                            }
                        }}
                        rowClassName={(record) => {
                            if (record.status === 'present') return 'row-present';
                            if (record.status === 'absent') return 'row-absent';
                            if (record.status === 'late') return 'row-late';
                            if (record.status === 'excused') return 'row-excused';
                            if (record.status === 'sick_leave') return 'row-sick';
                            if (record.status === 'vacation') return 'row-vacation';
                            return '';
                        }}
                    />
                </Card>
            </Card>

            <style>{`
                .row-present {
                    background-color: #f6ffed !important;
                }
                .row-absent {
                    background-color: #fff1f0 !important;
                }
                .row-late {
                    background-color: #fffbe6 !important;
                }
                .row-excused {
                    background-color: #f0f5ff !important;
                }
                .row-sick {
                    background-color: #fff0f6 !important;
                }
                .row-vacation {
                    background-color: #f9f0ff !important;
                }
                .ant-table-tbody > tr.row-present:hover > td {
                    background-color: #d9f7be !important;
                }
                .ant-table-tbody > tr.row-absent:hover > td {
                    background-color: #ffccc7 !important;
                }
                .ant-table-tbody > tr.row-late:hover > td {
                    background-color: #ffe58f !important;
                }
                .ant-table-tbody > tr.row-excused:hover > td {
                    background-color: #d6e4ff !important;
                }
                .ant-table-tbody > tr.row-sick:hover > td {
                    background-color: #ffadd2 !important;
                }
                .ant-table-tbody > tr.row-vacation:hover > td {
                    background-color: #efdbff !important;
                }
            `}</style>
        </div>
    );
};

export default StaffAttendance;
