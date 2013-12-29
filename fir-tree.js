if (typeof requestAnimationFrame != 'function') {
    ['moz', 'webkit', 'ms'].some(function (p) {
        var f = this[p + 'RequestAnimationFrame']
        return typeof f == 'function'? (requestAnimationFrame = f): false
    }) || (requestAnimationFrame = function (f) {
        return setTimeout(f, 0)
    }) /* jshint -W030 */
}

(function (canvas) {
    /* Settings */
    var thetaEnd = 6 * Math.PI,
        lineSpacing = 1 / 30,
        lineLength = 0.5 * lineSpacing,
        rate = 1 / (2 * Math.PI),
        factor = rate / 3,
        cycle = 200,
        scene = [],
        /* Rendering */
        offsetX = 250,
        offsetY = 310,
        scaleX = 400,
        scaleY = 400,
        camX = 0,
        camY = 2,
        camZ = -3,
        cSize = 500,
        c = canvas.getContext('2d')

    canvas.width = canvas.height = cSize
    c.lineWidth = 1.44

    scene.push(new Coil({ color: '255,0,0', theta0: Math.PI }))
    scene.push(new Coil({ color: '100,200,255' }))

    requestAnimationFrame(paint)

    function paint() {
        var offset = 1 - Date.now() / cycle % 1, i = 0
        requestAnimationFrame(paint)
        c.clearRect(0, 0, cSize, cSize)
        for (; i < scene.length; ++i)
            scene[i].paint(offset)
    }

    function project(point) {
        return [offsetX + scaleX * (point[0] - camX) / -(point[2] + camZ),
                offsetY + scaleY * (point[1] - camY) / -(point[2] + camZ)]
    }

    function clamp(val, a, b) {
        return (val < a)? a: (val > b)? b: val
    }

    function pow3(a) { return a * a * a }

    function Coil(options) {
        this.color       = options.color       || '255,255,255'
        this.theta0      = options.theta0      || 0
        this.lineSpacing = options.lineSpacing || lineSpacing
        this.lineLength  = options.lineLength  || lineLength
        this.rate        = options.rate        || rate
        this.factor      = options.factor      || factor
    }

    Coil.prototype.paint = function (offset) {
        var theta = this.thetaDif(0, offset * this.lineSpacing),
            begin, end
        for (; theta < thetaEnd; theta += this.thetaDif(theta, this.lineSpacing)) {
            begin = this.getPoint(theta)
            end = this.getPoint(theta + this.thetaDif(theta, this.lineLength))
            this.line(begin, end)
        }
    }

    Coil.prototype.thetaDif = function (theta, length) {
        return length / Math.sqrt(this.rate * this.rate +
                                  this.factor * this.factor * theta * theta)
    }

    Coil.prototype.getPoint = function (theta) {
        return [theta * this.factor * Math.cos(this.theta0 + theta),
                theta * this.rate,
                theta * this.factor * Math.sin(this.theta0 + theta)]
    }

    Coil.prototype.line = function (begin, end) {
        var opacity = 0.24 + 0.76 * pow3(Math.min(0.96 + begin[2], 1))
        begin = project(begin)
        end = project(end)
        /* Actual rendering */
        c.beginPath()
        c.moveTo(begin[0], begin[1])
        c.lineTo(end[0], end[1])
        c.strokeStyle = 'rgba(' + this.color + ',' + opacity + ')'
        c.stroke()
    }
}(document.getElementsByTagName('canvas')[0]))
