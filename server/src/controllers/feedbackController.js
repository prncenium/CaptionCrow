import nodemailer from 'nodemailer';

export const submitFeedback = async (req, res) => {
    try {
        const { bug, improvement, suggestion } = req.body;
        const file = req.file; // Provided by multer middleware

        // 1. Configure the email transporter (Use your Gmail)
        // Note: You must generate an "App Password" in your Google Account Security settings
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // e.g., 'yourname@gmail.com'
                pass: process.env.EMAIL_APP_PASSWORD // e.g., 'abcd efgh ijkl mnop'
            }
        });

        // 2. Format the email content
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Sending it to yourself
            subject: '🚨 New CaptionForge Feedback',
            html: `
                <h2>New User Feedback</h2>
                <p><strong>🐛 Bugs/Issues:</strong><br/> ${bug || 'None reported'}</p>
                <p><strong>📈 Room for Improvement:</strong><br/> ${improvement || 'None reported'}</p>
                <p><strong>💡 Feature Suggestions:</strong><br/> ${suggestion || 'None reported'}</p>
            `,
            attachments: []
        };

        // 3. Attach the image if the user uploaded one
        if (file) {
            mailOptions.attachments.push({
                filename: file.originalname,
                content: file.buffer // Sending directly from memory
            });
        }

        // 4. Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Feedback sent successfully' });

    } catch (error) {
        console.error('Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process feedback' });
    }
};