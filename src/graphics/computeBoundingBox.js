/**
 * @file computeBoundingBox.js
 * @author mengke01
 * @date 
 * @description
 * 计算曲线包围盒
 * 
 * modify from: 
 * zrender
 * https://github.com/ecomfe/zrender/blob/master/src/tool/computeBoundingBox.js
 */

define(
    function(require) {
        /**
         * 计算包围盒
         */
        function computeBoundingBox(points) {
            if (points.length === 0) {
                return;
            }
            var left = points[0].x;
            var right = points[0].x;
            var top = points[0].y;
            var bottom = points[0].y;

            for (var i = 1; i < points.length; i++) {
                var p = points[i];
                if (p.x < left) {
                    left = p.x;
                }
                if (p.x > right) {
                    right = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
                if (p.y > bottom) {
                    bottom = p.y;
                }
            }
            return {
                x: left,
                y: top,
                width: right - left,
                height: bottom - top
            }
        }

        /**
          * 计算二阶贝塞尔曲线的包围盒
          * http://pissang.net/blog/?p=91
          */
        function computeQuadraticBezierBoundingBox(p0, p1, p2) {
            // Find extremities, where derivative in x dim or y dim is zero
            var tmp = (p0.x + p2.x - 2 * p1.x);
            // p1 is center of p0 and p2 in x dim
            var t1;
            if (tmp === 0) {
                t1 = 0.5;
            } else {
                t1 = (p0.x - p1.x) / tmp;
            }

            tmp = (p0.y + p2.y - 2 * p1.y);
            // p1 is center of p0 and p2 in y dim
            var t2;
            if (tmp === 0) {
                t2 = 0.5;
            } else {
                t2 = (p0.y - p1.y) / tmp;
            }

            t1 = Math.max(Math.min(t1, 1), 0);
            t2 = Math.max(Math.min(t2, 1), 0);

            var ct1 = 1 - t1;
            var ct2 = 1 - t2;

            var x1 = ct1 * ct1 * p0.x + 2 * ct1 * t1 * p1.x + t1 * t1 * p2.x;
            var y1 = ct1 * ct1 * p0.y + 2 * ct1 * t1 * p1.y + t1 * t1 * p2.y;

            var x2 = ct2 * ct2 * p0.x + 2 * ct2 * t2 * p1.x + t2 * t2 * p2.x;
            var y2 = ct2 * ct2 * p0.y + 2 * ct2 * t2 * p1.y + t2 * t2 * p2.y;

            return computeBoundingBox([p0, p2, {
                x: x1,
                y: y1
            },
            {
                x: x2,
                y: y2
            }]);
        }

        /**
         * 计算曲线包围盒
         * 
         * @private
         * @param {path} path对象
         * 
         * @return {Object} x,y,width,height
         */
        function computePathBoundingBox(path) {
            var l = path.length;
            var i = -1;
            var points = [];
            while (++i < l) {
                var point = path[i];
                switch (point.c) {
                    case 'M':
                    case 'L':
                    case 'Z':
                        points.push(point.p);
                        break;
                    case 'Q':
                        var p0 = path[i - 1].p;
                        var bound = computeQuadraticBezierBoundingBox(p0, point.p1, point.p);
                        points.push(bound);
                        points.push({
                            x: bound.x,
                            y: bound.y + bound.height
                        });
                        points.push({
                            x: bound.x + bound.width,
                            y: bound.y
                        });
                        points.push({
                            x: bound.x + bound.width,
                            y: bound.y + bound.height
                        });
                        break;
                }
            }
            return computeBoundingBox(points);
        }


        /**
         * 计算曲线点边界
         * 
         * @private
         * @param {path} path对象
         * 
         * @return {Object} x,y,width,height
         */
        function computePathBox(path) {
            var l = path.length;
            var i = -1;
            var points = [];
            while (++i < l) {
                var point = path[i];
                switch (point.c) {
                    case 'M':
                    case 'L':
                    case 'Z':
                        points.push(point.p);
                        break;
                    case 'Q':
                        points.push(point.p1);
                        points.push(point.p);
                        break;
                }
            }
            return computeBoundingBox(points);
        }

        return {
            computeBounding: computeBoundingBox,
            quadraticBezier: computeQuadraticBezierBoundingBox,
            computePath: computePathBoundingBox,
            computePathBox: computePathBox,
        };
    }
);