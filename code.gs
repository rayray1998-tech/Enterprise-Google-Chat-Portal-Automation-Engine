// MULTI-SPACE WEBHOOK CONFIGURATION
const WEBHOOK_URLS = {
  'VM CM': 'https://chat.googleapis.com/v1/spaces/AAAAAlZa_LQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=Ae3KM8N48boQs7TuVOZwHWUHnJbIo51Ybx9Xo0WyeG0',
  'VM EOD': 'https://chat.googleapis.com/v1/spaces/AAQApm1A-GA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=z0F1l98YtBOZlGGZZkUgmCG2Sq1TO8errv-IuGIIag8',
  'CM EOD': 'https://chat.googleapis.com/v1/spaces/AAQA7Y12Yl0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=N1-mx_SRoItU4UJI8BjxiwtgguJBxwF1CYVhc8Z2To4'
};

const DATABASE_SHEET_URL = 'PASTE_YOUR_GOOGLE_SHEET_URL_HERE'; 

function doGet() {
  const template = HtmlService.createTemplateFromFile('Index');
  const savedBg = PropertiesService.getScriptProperties().getProperty('ADMIN_BG_IMAGE');
  template.bgImageUrl = savedBg ? savedBg : 'https://images.unsplash.com/photo-1629946832022-c327f74956e0?q=100&w=2560&auto=format&fit=crop';

  return template.evaluate()
    .setTitle('Enterprise Chat Portal')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function saveAdminBackground(imageUrl) {
  try {
    PropertiesService.getScriptProperties().setProperty('ADMIN_BG_IMAGE', imageUrl);
    return { success: true, message: "Background updated globally!" };
  } catch (error) {
    return { success: false, message: "Failed to save background." };
  }
}

function processSubmission(formData) {
  const userEmail = Session.getActiveUser().getEmail(); 
  
  if (formData.timing === 'later' && formData.scheduleDate) {
    const scheduleTime = new Date(formData.scheduleDate);
    if (scheduleTime <= new Date()) {
      return { success: false, message: "Scheduled time must be in the future." };
    }
    
    formData.senderEmail = userEmail; 
    const trigger = ScriptApp.newTrigger('handleScheduledTrigger').timeBased().at(scheduleTime).create();
    PropertiesService.getScriptProperties().setProperty(trigger.getUniqueId(), JSON.stringify(formData));
    
    logToDatabase(userEmail, formData.type, formData.message, formData.space, `Scheduled for ${scheduleTime.toLocaleString()}`);
    return { success: true, message: `Message scheduled successfully for ${scheduleTime.toLocaleString()}!` };
  } else {
    return sendToChat(formData, userEmail);
  }
}

function handleScheduledTrigger(event) {
  const triggerId = event.triggerUid;
  const props = PropertiesService.getScriptProperties();
  const savedData = props.getProperty(triggerId);
  
  if (savedData) {
    const formData = JSON.parse(savedData);
    sendToChat(formData, formData.senderEmail); 
    props.deleteProperty(triggerId); 
  }

  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getUniqueId() === triggerId) ScriptApp.deleteTrigger(trigger);
  });
}

function sendToChat(formData, senderEmail) {
  const { space, type, message, mentions, imageUrl } = formData;
  const webhookUrl = WEBHOOK_URLS[space];

  if (!webhookUrl) {
    return { success: false, message: `Webhook URL not configured for space: ${space}` };
  }

  let cardHeader = {};
  let iconUrl = "";

  switch(type) {
    case 'General Reminder':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/notifications_active/v1/color-24dp/1x/baseline_notifications_active_color_24dp.png";
      cardHeader = { title: "<font color=\"#1a73e8\"><b>📅 General Reminder</b></font>" };
      break;
    case 'Monthly PKT':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/assessment/v1/color-24dp/1x/baseline_assessment_color_24dp.png";
      cardHeader = { title: "<font color=\"#34a853\"><b>📈 Monthly PKT</b></font>" };
      break;
    case 'Announcement':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/campaign/v1/color-24dp/1x/baseline_campaign_color_24dp.png";
      cardHeader = { title: "<font color=\"#ea4335\"><b>📢 Announcement</b></font>" };
      break;
    case 'Kudos':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/celebration/v1/color-24dp/1x/baseline_celebration_color_24dp.png";
      cardHeader = { title: "<font color=\"#fbbc04\"><b>🎉 Kudos! Awesome Job!</b></font>" };
      break;
    case 'Rewards & Recognition':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/emoji_events/v1/color-24dp/1x/baseline_emoji_events_color_24dp.png";
      cardHeader = { title: "<font color=\"#f29900\"><b>🏆 Rewards & Recognition</b></font>" };
      break;
    case 'Incident / Outage Alert':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/warning/v1/color-24dp/1x/baseline_warning_color_24dp.png";
      cardHeader = { title: "<font color=\"#d93025\"><b>🚨 Incident Alert</b></font>" };
      break;
    case 'Poll / Feedback Request':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/poll/v1/color-24dp/1x/baseline_poll_color_24dp.png";
      cardHeader = { title: "<font color=\"#1a73e8\"><b>📊 Feedback Request</b></font>" };
      break;
    case 'Welcome / Onboarding':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/waving_hand/v1/color-24dp/1x/baseline_waving_hand_color_24dp.png";
      cardHeader = { title: "<font color=\"#34a853\"><b>👋 Welcome to the Team!</b></font>" };
      break;
    case 'Process Update':
      iconUrl = "https://fonts.gstatic.com/s/i/googlematerialicons/lightbulb/v1/color-24dp/1x/baseline_lightbulb_color_24dp.png";
      cardHeader = { title: "<font color=\"#9334e6\"><b>💡 Process Update</b></font>" };
      break;
  }

  cardHeader.imageUrl = iconUrl;
  cardHeader.imageType = "CIRCLE";

  const finalMessage = mentions ? `${message}\n\n${mentions}` : message;

  let sections = [{ widgets: [{ textParagraph: { text: finalMessage } }] }];

  if (imageUrl && imageUrl.trim() !== "") {
    sections[0].widgets.push({ image: { imageUrl: imageUrl.trim() } });
  }

  const payload = {
    cardsV2: [{ cardId: "reminder-card-" + new Date().getTime(), card: { header: cardHeader, sections: sections } }]
  };

  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
    
    // We still log senderEmail privately to your Google Sheet database for internal accountability
    logToDatabase(senderEmail, type, message, space, "Success");
    return { success: true, message: `Message successfully blasted to ${space}!` };
  } catch (error) {
    logToDatabase(senderEmail, type, message, space, `Failed: ${error.toString()}`);
    return { success: false, message: "Error sending message: " + error.toString() };
  }
}

function logToDatabase(email, type, message, space, status) {
  try {
    const sheet = SpreadsheetApp.openByUrl(DATABASE_SHEET_URL).getSheetByName('AuditLog');
    sheet.appendRow([new Date(), email, type, space, message, status]);
  } catch (e) {
    console.error("Database logging failed", e);
  }
}
