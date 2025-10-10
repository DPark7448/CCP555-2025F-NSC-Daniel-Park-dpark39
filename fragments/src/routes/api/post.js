const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

// Raw body parser that only runs for supported types
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type); // A1: text/plain only
      } catch {
        return false;
      }
    },
  });

module.exports = [
  rawBody(),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      req.log?.warn('unsupported content-type on POST /v1/fragments');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }

    const { type } = contentType.parse(req);
    const frag = new Fragment({ ownerId: req.user.ownerId, type });
    await frag.save(req.body);

    const base = process.env.API_URL || `http://${req.headers.host}`;
    const location = new URL(`/v1/fragments/${frag.id}`, base).toString();

    res.set('Location', location);
    res.status(201).json(createSuccessResponse({ fragment: { ...frag } }));
  },
];
