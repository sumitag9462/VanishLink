const Biolink = require('../models/Biolink');

exports.createBiolink = async (req, res) => {
  try {
    const { username, workspaceId, profileName, bio, theme, links } = req.body;
    
    // Check if username is already taken
    const existing = await Biolink.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const biolink = new Biolink({
      username,
      workspaceId,
      profileName,
      bio,
      theme,
      links: links || []
    });

    await biolink.save();
    res.status(201).json(biolink);
  } catch (err) {
    console.error('Error creating Biolink:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getBiolinkByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const biolink = await Biolink.findOne({ username });
    
    if (!biolink) {
      return res.status(404).json({ message: 'Biolink profile not found' });
    }

    // Increment views async
    biolink.views += 1;
    biolink.save().catch(e => console.error('Error updating biolink view count:', e));

    res.json(biolink);
  } catch (err) {
    console.error('Error fetching Biolink:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBiolink = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = Date.now();

    const biolink = await Biolink.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!biolink) {
      return res.status(404).json({ message: 'Biolink not found' });
    }

    res.json(biolink);
  } catch (err) {
    console.error('Error updating Biolink:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
