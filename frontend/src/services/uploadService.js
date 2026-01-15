import axios from 'axios';

// رفع صورة
export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');

    const response = await axios.post('/api/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
};

// حذف صورة
export const deleteImage = async (filename) => {
    const token = localStorage.getItem('token');

    const response = await axios.delete(`/api/upload/${filename}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    return response.data;
};

export default {
    uploadImage,
    deleteImage
};
