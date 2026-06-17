const { Parser } = require('json2csv');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const Link = require('../models/Link');

exports.exportAnalyticsCSV = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Authorization check - must own link
    const link = await Link.findOne({ slug });
    if (!link) return res.status(404).json({ message: 'Link not found' });
    
    // Optionally check if req.user.email === link.ownerEmail or if workspace admin

    const events = await AnalyticsEvent.find({ slug }).sort({ timestamp: -1 }).lean();

    if (!events || events.length === 0) {
      return res.status(404).json({ message: 'No analytics data found for this link' });
    }

    // Phase 3: CSV Generation
    const fields = ['timestamp', 'ip', 'userAgent', 'deviceType', 'country', 'destinationChosen', 'botDetected', 'routingMode'];
    const opts = { fields };
    
    const parser = new Parser(opts);
    const csv = parser.parse(events);

    res.header('Content-Type', 'text/csv');
    res.attachment(`analytics-${slug}.csv`);
    return res.send(csv);

  } catch (err) {
    console.error('CSV Export Error:', err);
    res.status(500).json({ message: 'Failed to generate CSV export' });
  }
};
