const phongUniforms = {
    descs: [
        {
            name: 'info',
            location: null,
        },
        {
            name: 'modelview',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: 'pieceTexture',
            location: null,
        },
        {
            name: 'projection',
            location: null,
        },
        {
            name: 'normalTexture',
            location: null,
        },
        {
            name: 'flip',
            location: null,
        },
        {
            name: null,
            location: null,
        },
    ]
};
const tablaUniforms = {
    descs: [
        {
            name: 'info',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: 'mvp',
            location: null,
        },
        {
            name: 'tablaTexture',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: 'cieloTexture',
            location: null,
        },
        {
            name: 'cameraPos',
            location: null,
        },
        {
            name: null,
            location: null,
        },
    ]
};
const basicUniforms = {
    descs: [
        {
            name: 'info',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: 'mvp',
            location: null,
        },
        {
            name: 'pieceTexture',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: 'flip',
            location: null,
        },
        {
            name: null,
            location: null,
        },
    ]
};
const topUniforms = {
    descs: [
        {
            name: 'info',
            location: null,
        },
        {
            name: 'vp',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: 'model',
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: null,
            location: null,
        },
        {
            name: null,
            location: null,
        },
    ]
};
export const glUniforms = [
    basicUniforms,
    phongUniforms,
    tablaUniforms,
    topUniforms,
];
