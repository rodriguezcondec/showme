export var EShader;
(function (EShader) {
    EShader[EShader["Basic"] = 0] = "Basic";
    EShader[EShader["Phong"] = 1] = "Phong";
    EShader[EShader["Tabla"] = 2] = "Tabla";
    EShader[EShader["Top"] = 3] = "Top";
    EShader[EShader["Last"] = 4] = "Last";
})(EShader || (EShader = {}));
export var EUniform;
(function (EUniform) {
    EUniform[EUniform["Info"] = 0] = "Info";
    EUniform[EUniform["Mv"] = 1] = "Mv";
    EUniform[EUniform["Mvp"] = 2] = "Mvp";
    EUniform[EUniform["PieceTexture"] = 3] = "PieceTexture";
    EUniform[EUniform["Projection"] = 4] = "Projection";
    EUniform[EUniform["NormalTexture"] = 5] = "NormalTexture";
    EUniform[EUniform["Flip"] = 6] = "Flip";
    EUniform[EUniform["Color"] = 7] = "Color";
    EUniform[EUniform["ColorSat"] = 8] = "ColorSat";
})(EUniform || (EUniform = {}));
export var EShaderMode;
(function (EShaderMode) {
    EShaderMode["Basic"] = "basic";
    EShaderMode["Dem"] = "dem";
    EShaderMode["Multi"] = "multi";
    EShaderMode["Phong"] = "phong";
})(EShaderMode || (EShaderMode = {}));
export var EMulti;
(function (EMulti) {
    EMulti["None"] = "none";
    EMulti["Add"] = "add";
    EMulti["Sub"] = "sub";
})(EMulti || (EMulti = {}));
export var EFlipType;
(function (EFlipType) {
    EFlipType[EFlipType["None"] = 0] = "None";
    EFlipType[EFlipType["X"] = 1] = "X";
    EFlipType[EFlipType["Y"] = 2] = "Y";
    EFlipType[EFlipType["Both"] = 3] = "Both";
})(EFlipType || (EFlipType = {}));
export var EKeyId;
(function (EKeyId) {
    EKeyId["ArrowLeft"] = "left";
    EKeyId["ArrowRight"] = "right";
    EKeyId["ArrowUp"] = "up";
    EKeyId["ArrowDown"] = "down";
    EKeyId["ZoomIn"] = "in";
    EKeyId["ZoomOut"] = "out";
})(EKeyId || (EKeyId = {}));
export var EEdgeFlag;
(function (EEdgeFlag) {
    EEdgeFlag[EEdgeFlag["left"] = 1] = "left";
    EEdgeFlag[EEdgeFlag["right"] = 2] = "right";
    EEdgeFlag[EEdgeFlag["top"] = 4] = "top";
    EEdgeFlag[EEdgeFlag["bottom"] = 8] = "bottom";
})(EEdgeFlag || (EEdgeFlag = {}));
