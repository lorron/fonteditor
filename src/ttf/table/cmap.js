/**
 * @file cmap.js
 * @author mengke01
 * @date 
 * @description
 * cmap 表
 */

define(
    function(require) {
        var table = require('./table');
        var struct = require('./struct');


        /**
         * 读取子表
         * Each 'cmap' subtable is in one of nine currently available
         *  formats. These are format 0, format 2, format 4,
         *  format 6, format 8.0, format 10.0, format 12.0,
         *  format 13.0, and format 14 described in the next section.
         * https://developer.apple.com/fonts/TrueType-Reference-Manual/RM06/Chap6cmap.html
         */
        function readSubTable(reader, ttf, subTable, cmapOffset) {
            var startOffset = cmapOffset + subTable.offset; 
            subTable.format = reader.readUint16(startOffset);

            var i;

            // 双字节编码，非紧凑排列
            if(subTable.format == 4) {
                var format4 = subTable;
                // 跳过format字段
                format4.length = reader.readUint16();
                format4.language = reader.readUint16();
                format4.segCountX2 = reader.readUint16();
                format4.searchRange = reader.readUint16();
                format4.entrySelector = reader.readUint16();
                format4.rangeShift = reader.readUint16();

                var segCount = format4.segCountX2 / 2;

                // end code
                var endCode = [];
                for(i = 0; i < segCount; ++i) {
                    endCode.push(reader.readUint16());
                }
                format4.endCode = endCode;

                format4.reservedPad = reader.readUint16();

                // start code
                var startCode = [];
                for(i = 0; i < segCount; ++i) {
                    startCode.push(reader.readUint16());
                }
                format4.startCode = startCode;

                // idDelta
                var idDelta = [];
                for(i = 0; i < segCount; ++i) {
                    idDelta.push(reader.readUint16());
                }
                format4.idDelta = idDelta;

                // idRangeOffset
                var idRangeOffset = [];
                for(i = 0; i < segCount; ++i) {
                    idRangeOffset.push(reader.readUint16());
                }
                format4.idRangeOffset = idRangeOffset;

                // 总长度 - glyphIdArray起始偏移/2
                var glyphCount = (format4.length - (reader.offset - startOffset)) / 2;
                
                // glyphIdArray
                var glyphIdArray = [];
                for(i = 0; i < glyphCount; ++i) {
                    glyphIdArray.push(reader.readUint16());
                }

                format4.glyphIdArray = glyphIdArray;

            }
            // The firstCode and entryCount values in the subtable specify 
            // the useful subrange within the range of possible character codes. 
            // The range begins with firstCode and has a length equal to entryCount. 
            else if(subTable.format == 6) {
                var format6 = subTable;

                format6.length = reader.readUint16();
                format6.language = reader.readUint16();
                format6.firstCode = reader.readUint16();
                format6.entryCount = reader.readUint16();

                var glyphIndexArray = [];
                var entryCount = format6.entryCount;
                // 读取字符分组
                for (i = 0; i < entryCount; ++i){
                    glyphIndexArray.push(reader.readUint16());
                }
                format6.glyphIdArray = glyphIndexArray;

            }
            // defines segments for sparse representation in 4-byte character space
            else if(subTable.format == 12) {
                var format12 = subTable;

                format12.reserved = reader.readUint16();
                format12.length = reader.readUint32();
                format12.language = reader.readUint32();
                format12.nGroups = reader.readUint32();

                var groups = [];
                var nGroups = format12.nGroups;
                // 读取字符分组
                for (i = 0; i < nGroups; ++i){
                    var group = {};
                    group.startCharCode = reader.readUint32();
                    group.endCharCode = reader.readUint32();
                    group.startGlyphID = reader.readUint32();
                    groups.push(groups);
                }

            }
        }



        var cmap = table.create(
            'cmap', 
            [],
            {
                read: function(reader, ttf) {
                    var tcmap = {};
                    var cmapOffset = this.offset;

                    reader.seek(cmapOffset);

                    tcmap.version = reader.readUint16(); // 编码方式
                    var numberSubtables = tcmap.numberSubtables = reader.readUint16(); // 表个数


                    var subTables = tcmap.tables = []; // 名字表
                    var offset = reader.offset;

                    // 使用offset读取，以便于查找
                    for(var i = 0, l = numberSubtables; i < l; i++) {
                        var subTable = {};
                        subTable.platformID = reader.readUint16(offset);
                        subTable.encodingID = reader.readUint16(offset + 2);
                        subTable.offset = reader.readUint32(offset + 4);

                        readSubTable(reader, ttf, subTable, cmapOffset);
                        subTables.push(subTable);

                        offset += 8;
                    }
                    
                    tcmap.tables = subTables;

                    return tcmap;
                }
            }
        );

        return cmap;
    }
);