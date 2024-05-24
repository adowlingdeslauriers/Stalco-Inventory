import nodemailer from 'nodemailer';

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.SERVICE_PROVIDER,
  auth: {
    user: process.env.TRANSPORTER_APP_USER, // Your Gmail address
    pass: process.env.TRANSPORTER_APP_PASS, // Your Gmail password or App Password
  },
});

// Function to generate HTML table from data
function generateHTMLTable(data: any[]): string {
    let html = `
    <h3> Below is a list of inventory which needs to be replenished :  </h3>

      <table style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Client</th>
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">SKU</th>
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Threshold</th>
            <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Qty To Replenish</th>
          </tr>
        </thead>
        <tbody>
    `;
  
    data.forEach(item => {
      html += `
      
        <tr>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.clientName}</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.sku}</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.threshold}</td>
          <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${item.qtyToReplenish}</td>
        </tr>
      `;
    });
  
    html += `
        </tbody>
      </table>
    `;
  
    return html;
  }

export async function sendEmail(data: any): Promise<void> {
  // Email content
  let mailOptions = {
    from: 'stalco3pl@gmail.com',
    to: 'inventory@stalco.ca', // Email address you want to send to
    subject: 'Replenishment Flags Data',
    text: 'Automated',
    html: generateHTMLTable(data), // Convert data to string for email body
  };



  

  // Send email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
