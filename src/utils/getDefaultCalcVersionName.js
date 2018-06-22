module.exports = () => new Date().toISOString().replace(/-|:|\..*/g, '');
