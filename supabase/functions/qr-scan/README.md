# qr-scan
Public QR scan endpoint deployed in Supabase Edge Functions. It validates a permanent QR token, records a scan, creates the monthly threshold alert when needed, and returns a 15-minute signed URL for the currently published city guide.
