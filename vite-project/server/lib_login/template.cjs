module.exports = {
  HTML: function (title, body, authStatusUI = '') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
      </head>
      <body>
        ${authStatusUI}
        ${body}
      </body>
      </html>
    `;
  }
};
