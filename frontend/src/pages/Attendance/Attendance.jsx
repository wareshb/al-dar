import React, { useState, useEffect } from 'react';
import { 
    Table, 
    Button, 
    Space, 
    Card, 
    Select, 
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
    Badge,
    Typography,
    Divider
} from 'antd';
import { 
    SaveOutlined, 
    ReloadOutlined, 
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';
import { getHalaqat, getHalaqaById } from '../../services/halaqaService';
import { getHalaqaAttendance, recordAttendance } from '../../services/attendanceService';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

const Attendance = () => {
    const [halaqat, setHalaqat] = useState([]);
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [halaqaInfo, setHalaqaInfo] = useState(null);
    const [date, setDate] = useState(dayjs());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0
    });
    const [expandedRows, setExpandedRows] = useState({});

    useEffect(() => {
        loadHalaqat();
    }, []);

    useEffect(() => {
        if (selectedHalaqa) {
            loadHalaqaInfo();
        }
    }, [selectedHalaqa]);

    const loadHalaqat = async () => {
        try {
            const result = await getHalaqat();
            if (result.success) {
                setHalaqat(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل الحلقات');
        }
    };

    const loadHalaqaInfo = async () => {
        try {
            const result = await getHalaqaById(selectedHalaqa);
            if (result.success) {
                setHalaqaInfo(result.data);
            }
        } catch (error) {
            console.error('Error loading halaqa info:', error);
        }
    };

    const loadAttendance = async () => {
        if (!selectedHalaqa) {
            message.warning('يرجى اختيار حلقة أولاً');
            return;
        }

        setLoading(true);
        try {
            const result = await getHalaqaAttendance(selectedHalaqa, date.format('YYYY-MM-DD'));
            if (result.success) {
                setStudents(result.data);
                setStats(result.stats || {
                    total: result.data.length,
                    present: result.data.filter(s => s.status === 'present').length,
                    absent: result.data.filter(s => s.status === 'absent').length,
                    late: result.data.filter(s => s.status === 'late').length,
                    excused: result.data.filter(s => s.status === 'excused').length
                });
            }
        } catch (error) {
            message.error('خطأ في تحميل كشف الحضور');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setStudents(prev => prev.map(s => {
            if (s.student_id === studentId) {
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

    const handleTimeChange = (studentId, field, time) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId 
                ? { ...s, [field]: time ? time.format('HH:mm:ss') : null }
                : s
        ));
    };

    const handleNotesChange = (studentId, notes) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, notes } : s
        ));
    };

    const updateStats = () => {
        const newStats = {
            total: students.length,
            present: students.filter(s => s.status === 'present').length,
            absent: students.filter(s => s.status === 'absent').length,
            late: students.filter(s => s.status === 'late').length,
            excused: students.filter(s => s.status === 'excused').length
        };
        setStats(newStats);
    };

    useEffect(() => {
        updateStats();
    }, [students]);

    const handleSave = async () => {
        if (students.length === 0) {
            message.warning('لا يوجد طلاب لحفظ الحضور');
            return;
        }

        setSaving(true);
        try {
            const attendanceRecords = students.map(s => ({
                attendance_id: s.attendance_id || null,
                student_id: s.student_id,
                status: s.status,
                check_in_time: s.check_in_time || null,
                check_out_time: s.check_out_time || null,
                notes: s.notes || ''
            }));

            const result = await recordAttendance({
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

    const getStatusColor = (status) => {
        const colors = {
            present: 'success',
            absent: 'error',
            late: 'warning',
            excused: 'default'
        };
        return colors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            present: <CheckCircleOutlined />,
            absent: <CloseCircleOutlined />,
            late: <ClockCircleOutlined />,
            excused: <FileTextOutlined />
        };
        return icons[status] || null;
    };

    const getStatusText = (status) => {
        const texts = {
            present: 'حاضر',
            absent: 'غائب',
            late: 'متأخر',
            excused: 'معذور'
        };
        return texts[status] || status;
    };

    const toggleRowExpand = (studentId) => {
        setExpandedRows(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
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
            title: 'اسم الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
            fixed: 'left',
            width: 200,
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'الحالة',
            key: 'status',
            width: 280,
            render: (_, record) => (
                <Radio.Group
                    value={record.status}
                    onChange={(e) => handleStatusChange(record.student_id, e.target.value)}
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
                    onChange={(time) => handleTimeChange(record.student_id, 'check_in_time', time)}
                    format="HH:mm"
                    size="small"
                    placeholder="وقت الدخول"
                    style={{ width: '100%' }}
                    disabled={record.status === 'absent'}
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
                    onChange={(time) => handleTimeChange(record.student_id, 'check_out_time', time)}
                    format="HH:mm"
                    size="small"
                    placeholder="وقت الخروج"
                    style={{ width: '100%' }}
                    disabled={record.status === 'absent'}
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
                        onClick={() => toggleRowExpand(record.student_id)}
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
                    onChange={(e) => handleNotesChange(record.student_id, e.target.value)}
                    placeholder="أدخل ملاحظات حول حضور الطالب..."
                    rows={3}
                    style={{ marginTop: 8 }}
                />
                {record.phone && (
                    <div style={{ marginTop: 12 }}>
                        <Text type="secondary">رقم الهاتف: {record.phone}</Text>
                    </div>
                )}
                {record.guardian_phone && (
                    <div>
                        <Text type="secondary">رقم ولي الأمر: {record.guardian_phone}</Text>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2} style={{ marginBottom: 24 }}>
                    تسجيل الحضور والغياب
                </Title>

                {/* معلومات الحلقة */}
                {halaqaInfo && (
                    <Card 
                        size="small" 
                        style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong style={{ color: 'white', fontSize: 16 }}>
                                    الحلقة: {halaqaInfo.halaqa?.name}
                                </Text>
                            </Col>
                            {halaqaInfo.halaqa?.teacher_name && (
                                <Col span={12}>
                                    <Text style={{ color: 'white' }}>
                                        المعلم: {halaqaInfo.halaqa.teacher_name}
                                    </Text>
                                </Col>
                            )}
                        </Row>
                    </Card>
                )}

                {/* الفلترة */}
                <Card size="small" style={{ marginBottom: 24 }}>
                    <Space size="large" wrap>
                        <Space>
                            <Text strong>الحلقة:</Text>
                            <Select
                                placeholder="اختر الحلقة"
                                style={{ width: 250 }}
                                onChange={(value) => {
                                    setSelectedHalaqa(value);
                                    setStudents([]);
                                    setStats({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
                                }}
                                value={selectedHalaqa}
                            >
                                {halaqat.map(h => (
                                    <Option key={h.id} value={h.id}>{h.name}</Option>
                                ))}
                            </Select>
                        </Space>
                        <Space>
                            <Text strong>التاريخ:</Text>
                            <DatePicker
                                value={date}
                                onChange={(newDate) => {
                                    setDate(newDate);
                                    setStudents([]);
                                    setStats({ total: 0, present: 0, absent: 0, late: 0, excused: 0 });
                                }}
                                allowClear={false}
                                format="YYYY-MM-DD"
                                style={{ width: 200 }}
                            />
                        </Space>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={loadAttendance}
                            disabled={!selectedHalaqa}
                            size="large"
                        >
                            تحميل كشف الحضور
                        </Button>
                    </Space>
                </Card>

                {/* الإحصائيات */}
                {students.length > 0 && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="إجمالي الطلاب"
                                    value={stats.total}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="حاضر"
                                    value={stats.present}
                                    prefix={<CheckCircleOutlined />}
                                    valueStyle={{ color: '#52c41a' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="غائب"
                                    value={stats.absent}
                                    prefix={<CloseCircleOutlined />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card>
                                <Statistic
                                    title="متأخر / معذور"
                                    value={stats.late + stats.excused}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                )}

                {/* زر الحفظ أعلى الجدول */}
                {students.length > 0 && (
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
                        dataSource={students}
                        rowKey="student_id"
                        loading={loading}
                        pagination={{
                            pageSize: 20,
                            showSizeChanger: true,
                            showTotal: (total) => `إجمالي ${total} طالب`,
                        }}
                        scroll={{ x: 1200 }}
                        expandable={{
                            expandedRowRender,
                            expandedRowKeys: Object.keys(expandedRows).filter(key => expandedRows[key]),
                            onExpand: (expanded, record) => {
                                toggleRowExpand(record.student_id);
                            }
                        }}
                        rowClassName={(record) => {
                            if (record.status === 'present') return 'row-present';
                            if (record.status === 'absent') return 'row-absent';
                            if (record.status === 'late') return 'row-late';
                            if (record.status === 'excused') return 'row-excused';
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
            `}</style>
        </div>
    );
};

export default Attendance;
