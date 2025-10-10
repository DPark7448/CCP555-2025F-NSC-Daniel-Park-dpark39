const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  const { id } = req.params;
  const frag = await Fragment.byId(req.user.ownerId, id);
  if (!frag) return res.status(404).json(createErrorResponse(404, 'Not Found'));

  const data = await frag.data(); // Buffer
  res.status(200).json(
    createSuccessResponse({
      fragment: { ...frag },
      data: data ? data.toString() : '',
    }),
  );
};
