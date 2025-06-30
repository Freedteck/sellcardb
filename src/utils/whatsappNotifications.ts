export interface WhatsAppNotificationData {
  sellerWhatsApp: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  itemName: string;
  itemType: 'product' | 'service';
  message: string;
  inquiryId: string;
}

export const sendWhatsAppNotification = (data: WhatsAppNotificationData) => {
  const {
    sellerWhatsApp,
    customerName,
    customerPhone,
    customerEmail,
    itemName,
    itemType,
    message,
    inquiryId
  } = data;

  const domain = window.location.origin;
  const responseLink = `${domain}/dashboard/inquiries/${inquiryId}`;
  
  const notificationMessage = `🔔 NEW INQUIRY ALERT!

📝 Customer: ${customerName}
📱 ${itemType === 'product' ? '📦' : '🛠️'} Item: ${itemName}
${customerPhone ? `📞 Phone: ${customerPhone}` : ''}
${customerEmail ? `📧 Email: ${customerEmail}` : ''}

💬 Message:
"${message}"

🔗 Respond here: ${responseLink}

Powered by ShopLink 🛍️`;

  const whatsappUrl = `https://wa.me/${sellerWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(notificationMessage)}`;
  
  // Open WhatsApp in a new tab (seller will receive this as a self-message notification)
  window.open(whatsappUrl, '_blank');
};

export const formatWhatsAppResponse = (
  customerName: string,
  itemName: string,
  responseMessage: string
) => {
  return `Hi ${customerName}! 

Thank you for your inquiry about "${itemName}". 

${responseMessage}

Feel free to ask if you have any other questions!

Best regards,
Your ShopLink Seller 🛍️`;
};