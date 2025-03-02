//que salgan las respuestas existosas o error

exports.success = function (req, res, mensaje, status) {
    const statusCodigo = status || 200;
    const mensajeOK = mensaje || '';
    res.status(statusCodigo).send({
        error: false,
        status: statusCodigo,
        body: mensajeOK
    });
}

exports.error = function (req, res, mensaje, status) {
    const statusCodigo = status || 500;
    const mensajeError = mensaje || '';
    res.status(statusCodigo).send({
        error: true,
        status: statusCodigo,
        body: mensajeError
    });
}