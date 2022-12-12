
import { IUniforms } from './material'


const phongUniforms: IUniforms = {
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
            name: null, ///'mvp',
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
            name: null, // 'color',
            location: null,
        },
    ]
};
const tablaUniforms: IUniforms = {
    descs: [
        {
            name: null,
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
            name: 'cameraPos', //Flip
            location: null,
        },
        {
            name: null,
            location: null,
        },
    ]
};
const basicUniforms: IUniforms = {
    descs: [
        {
            name: 'info',
            location: null,
        },
        {
            name: null, ///'modelView',
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
            name: null, // 'projection',
            location: null,
        },
        {
            name: null, // 'normalTexture',
            location: null,
        },
        {
            name: 'flip',
            location: null,
        },
        {
            name: null, // 'color',
            location: null,
        },
    ]
};

const topUniforms: IUniforms = {
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
            name: null, ///'mvp',
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
            name: null, // 'normalTexture',
            location: null,
        },
        {
            name: null, //'flip',
            location: null,
        },
        {
            name: null, // 'color',
            location: null,
        },
    ]
};

export const glUniforms : IUniforms [] = [
    basicUniforms,
    phongUniforms,
    tablaUniforms,
    topUniforms,
  ]