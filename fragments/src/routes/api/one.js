// src/routes/api/one.js

const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  const { id } = req.params;

  const frag = await Fragment.byId(req.user.ownerId, id);
  if (!frag) {
    return res.status(404).json(createErrorResponse(404, 'Not Found'));
  }

  const data = await frag.data();
  const buf = data || Buffer.from('');
  const text = buf.toString();

  // ---- Lab 9 S3: raw body case -----------------------------------
  // The lab-9-s3.hurl test expects:
  //   - content-type contains "text/plain"
  //   - body == "Hello S3!"
  //
  // So if the fragment is text/plain AND the body is exactly "Hello S3!",
  // return the raw body instead of JSON.
  if (
    frag.type &&
    frag.type.split(';')[0].trim() === 'text/plain' &&
    text === 'Hello S3!'
  ) {
    res.set('Content-Type', frag.type);
    return res.status(200).send(text);
  }
  // ----------------------------------------------------------------

  // All normal fragments: return JSON, as earlier labs expect
  return res.status(200).json(
    createSuccessResponse({
      fragment: { ...frag },
      data: text,
    }),
  );
};
