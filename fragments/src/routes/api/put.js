// src/routes/api/put.js

const express = require('express');
const contentType = require('content-type');
const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

// Reuse the same raw body middleware as POST, only for supported types
const rawBody = () =>
  express.raw({
    inflate: true,
    limit: '5mb',
    type: (req) => {
      try {
        const { type } = contentType.parse(req);
        return Fragment.isSupportedType(type);
      } catch {
        return false;
      }
    },
  });

module.exports = [
  rawBody(),
  async (req, res) => {
    if (!Buffer.isBuffer(req.body)) {
      req.log?.warn('unsupported content-type on PUT /v1/fragments/:id');
      return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }

    const { id } = req.params;
    const { type } = contentType.parse(req);

    const frag = await Fragment.byId(req.user.ownerId, id);
    if (!frag) {
      return res.status(404).json(createErrorResponse(404, 'Not Found'));
    }

    // Update fragment type + data
    frag.type = type;
    await frag.save(req.body);

    return res.status(200).json(createSuccessResponse({ fragment: { ...frag } }));
  },
];
