const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const basicAuth = require('express-basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置管理员密码(实际使用时请修改)
const ADMIN_PASSWORD = '214214';

// 中间件
app.use(fileUpload());
app.use(express.static('public'));
app.use('/admin', express.static('admin'));
app.use('/uploads', express.static('uploads'));

// 确保目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 管理员上传路由
app.post('/admin/upload', (req, res) => {
    // 验证密码
    if (req.body.password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: '无效的管理员密码' });
    }

    if (!req.files || !req.files.pdf) {
        return res.status(400).json({ message: '没有上传文件' });
    }

    const pdfFile = req.files.pdf;
    
    // 检查文件类型
    if (pdfFile.mimetype !== 'application/pdf') {
        return res.status(400).json({ message: '只允许上传PDF文件' });
    }

    // 保存文件
    const filePath = path.join(uploadDir, 'current.pdf');
    pdfFile.mv(filePath, (err) => {
        if (err) {
            console.error('文件保存错误:', err);
            return res.status(500).json({ message: '文件保存失败' });
        }
        res.json({ message: '文件上传成功' });
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`前台访问: http://localhost:${PORT}`);
    console.log(`后台管理: http://localhost:${PORT}/admin`);
    console.log(`管理员密码: ${ADMIN_PASSWORD}`);
});