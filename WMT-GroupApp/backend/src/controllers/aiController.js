const Restaurant = require('../models/Restaurant');

const greetings = [
  "Excellent choice — let me suggest something memorable.",
  "A delight to assist tonight.",
  "Allow me to recommend a few favourites of ours."
];

const pickRandom = (arr, n) => {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
};

exports.recommend = async (req, res) => {
  try {
    const { restaurantId, prompt = '', preferences = [] } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const allItems = (restaurant.menu || []).flatMap((s) =>
      (s.items || []).map((i) => ({ ...(i.toObject?.() || i), section: s.title }))
    );

    let candidates = allItems;
    const lc = prompt.toLowerCase();
    if (lc) {
      const filtered = allItems.filter((i) =>
        (i.name + ' ' + (i.description || '') + ' ' + (i.tags || []).join(' '))
          .toLowerCase().includes(lc)
      );
      if (filtered.length) candidates = filtered;
    }
    if (preferences.length) {
      const tagFilter = candidates.filter((i) =>
        preferences.every((p) => (i.tags || []).map((t) => t.toLowerCase()).includes(p.toLowerCase()))
      );
      if (tagFilter.length) candidates = tagFilter;
    }

    const picks = pickRandom(candidates, Math.min(3, candidates.length));
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    let body = '';
    if (picks.length === 0) {
      body = `For tonight, I'd start with the chef's signature dish from ${restaurant.name}'s menu — it's what we are best known for.`;
    } else {
      body = picks.map((p, i) => {
        const lead = ['I would begin with', 'Then consider', 'Finally, do not miss'][i] || 'Also lovely:';
        return `${lead} the **${p.name}** ($${p.price.toFixed(2)}) — ${p.description || 'a long-standing favourite of ours.'}`;
      }).join('\n\n');
    }

    res.json({
      reply: `${greeting}\n\n${body}\n\nWould you like me to pair a wine with that?`,
      picks: picks.map((p) => ({ _id: p._id, name: p.name, price: p.price, section: p.section }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
