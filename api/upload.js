const fs = require('fs');
const path = require('path');
const formidable = require('formidable-serverless');

// 管理员密码(部署前请修改)
const ADMIN_PASSWORD = '214214';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const form = new formidable.IncomingForm();
        
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ message: '文件解析失败' });
            }

            // 验证密码
            if (fields.password !== ADMIN_PASSWORD) {
                return res.status(401).json({ message: '无效的管理员密码' });
            }

            if (!files.pdf) {
                return res.status(400).json({ message: '没有上传文件' });
            }

            // 检查文件类型
            if (files.pdf.type !== 'application/pdf') {
                return res.status(400).json({ message: '只允许上传PDF文件' });
            }

            // 在Vercel的无服务器环境中，我们需要将文件保存到/tmp目录
            const tempPath = files.pdf.path;
            const uploadDir = path.join('/tmp', 'uploads');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const newPath = path.join(uploadDir, 'current.pdf');
            
            // 移动文件
            fs.renameSync(tempPath, newPath);
            
            res.status(200).json({ message: '文件上传成功' });
        });
    } catch (error) {
        console.error('上传错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
};
