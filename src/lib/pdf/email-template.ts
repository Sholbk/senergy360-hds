export function buildReportEmailHtml(params: {
  projectName: string;
  siteAddress: string;
  checklistStats: string;
  photoCount: number;
  downloadUrl: string;
  customMessage?: string;
}): string {
  const { projectName, siteAddress, checklistStats, photoCount, downloadUrl, customMessage } = params;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f0;font-family:Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f0;padding:20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Gold Header Bar -->
          <tr>
            <td style="background-color:#C5A55A;height:6px;"></td>
          </tr>

          <!-- Logo / Brand -->
          <tr>
            <td style="padding:30px 40px 20px;text-align:center;">
              <h1 style="margin:0;font-size:22px;color:#1a1a1a;font-weight:bold;">CORE Framework</h1>
              <p style="margin:4px 0 0;font-size:12px;color:#888;">Healthy Home Advocates</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:0 40px 30px;">
              <h2 style="margin:0 0 16px;font-size:18px;color:#1a1a1a;text-align:center;">Your Construction Project Management Report is Ready</h2>

              <!-- Project Info -->
              <table role="presentation" width="100%" style="background-color:#f5f5f0;border-radius:6px;padding:16px;margin-bottom:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:bold;color:#1a1a1a;">${projectName}</p>
                    <p style="margin:0;font-size:12px;color:#666;">${siteAddress.replace(/\n/g, '<br>')}</p>
                  </td>
                </tr>
              </table>

              <!-- Stats -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td width="50%" style="padding-right:8px;">
                    <div style="background-color:#f5f5f0;border-radius:6px;padding:12px;text-align:center;">
                      <p style="margin:0;font-size:16px;font-weight:bold;color:#C5A55A;">${checklistStats}</p>
                      <p style="margin:4px 0 0;font-size:10px;color:#888;">Checklist Items</p>
                    </div>
                  </td>
                  <td width="50%" style="padding-left:8px;">
                    <div style="background-color:#f5f5f0;border-radius:6px;padding:12px;text-align:center;">
                      <p style="margin:0;font-size:16px;font-weight:bold;color:#C5A55A;">${photoCount}</p>
                      <p style="margin:4px 0 0;font-size:10px;color:#888;">Photos</p>
                    </div>
                  </td>
                </tr>
              </table>

              ${customMessage ? `
              <!-- Custom Message -->
              <div style="background-color:#fffef5;border-left:3px solid #C5A55A;padding:12px 16px;margin-bottom:20px;border-radius:0 4px 4px 0;">
                <p style="margin:0;font-size:12px;color:#1a1a1a;">${customMessage}</p>
              </div>
              ` : ''}

              <!-- Download Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:10px 0;">
                    <a href="${downloadUrl}" style="display:inline-block;padding:14px 40px;background-color:#C5A55A;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">Download Report</a>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0;font-size:11px;color:#999;text-align:center;">
                This download link expires in 7 days. Please save your report.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f5f5f0;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#888;">CORE Framework — Construction Project Management</p>
              <p style="margin:4px 0 0;font-size:10px;color:#aaa;">info@coreframework.app</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
