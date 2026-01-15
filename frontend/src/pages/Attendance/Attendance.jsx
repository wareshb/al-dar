import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Card, Select, DatePicker, message, Radio, Tag } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { getHalaqat } from '../../services/halaqaService';
import { getHalaqaAttendance, recordAttendance } from '../../services/attendanceService';
import dayjs from 'dayjs';

const { Option } = Select;

const Attendance = () => {
    const [halaqat, setHalaqat] = useState([]);
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [date, setDate] = useState(dayjs());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadHalaqat();
    }, []);

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

    const loadAttendance = async () => {
        if (!selectedHalaqa) return;

        setLoading(true);
        try {
            const result = await getHalaqaAttendance(selectedHalaqa, date.format('YYYY-MM-DD'));
            if (result.success) {
                // تجريف البيانات أو تعيين الحالات الافتراضية
                const attendanceData = result.data.map(item => ({
                    ...item,
                    status: item.status || 'present' // افتراضي: حاضر
                }));
                setStudents(attendanceData);
            }
        } catch (error) {
            message.error('خطأ في تحميل كشف الحضور');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setStudents(prev => prev.map(s =>
            s.student_id === studentId ? { ...s, status } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const attendanceRecords = students.map(s => ({
                student_id: s.student_id,
                halaqa_id: selectedHalaqa,
                attendance_date: date.format('YYYY-MM-DD'),
                status: s.status,
                notes: s.notes || ''
            }));

            const result = await recordAttendance({ attendance: attendanceRecords });
            if (result.success) {
                message.success('تم حفظ الحضور بنجاح');
                loadAttendance();
            }
        } catch (error) {
            message.error('خطأ في حفظ الحضور');
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: 'اسم الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
        },
        {
            title: 'الحالة',
            key: 'status',
            render: (_, record) => (
                <Radio.Group
                    value={record.status}
                    onChange={(e) => handleStatusChange(record.student_id, e.target.value)}
                    buttonStyle="solid"
                    size="small"
                >
                    <Radio.Button value="present">حاضر</Radio.Button>
                    <Radio.Button value="absent">غائب</Radio.Button>
                    <Radio.Button value="late">متأخر</Radio.Button>
                    <Radio.Button value="excused">عذر</Radio.Button>
                </Radio.Group>
            ),
        }
    ];

    return (
        <Card title="تسجيل الحضور والغياب">
            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="اختر الحلقة"
                    style={{ width: 200 }}
                    onChange={setSelectedHalaqa}
                >
                    {halaqat.map(h => (
                        <Option key={h.id} value={h.id}>{h.name}</Option>
                    ))}
                </Select>
                <DatePicker
                    value={date}
                    onChange={setDate}
                    allowClear={false}
                />
                <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={loadAttendance}
                    disabled={!selectedHalaqa}
                >
                    عرض الطلاب
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={students}
                rowKey="student_id"
                loading={loading}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />

            {students.length > 0 && (
                <div style={{ marginTop: 16, textAlign: 'left' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={handleSave}
                    >
                        حفظ جميع السجلات
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default Attendance;
