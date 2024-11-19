import { bash, sh } from "libs/utils"

const get = (args: string) => Number(Utils.exec(`brightnessctl ${args}`))

class Brightness extends Service {
    static {
	Service.register(this, {
	    'screen-changed': ['float']
	}, {
	    "screen-value": ["float", "rw"]
	})
    }
    
    #interface = Utils.exec("sh -c 'ls -w1 /sys/class/backlight | head -1'")

    #screenMax = get("max")
    #screen_value = 0

    get screen_value() {
	return this.#screen_value
    }

    set screen_value(percent) {
	if (percent < 0) {
	    percent = 0
	}
	if (percent > 1) {
	    percent = 1 
	}
	sh(`brightnessctl set ${Math.floor(percent * 100)}% -q`)
    }

    constructor() {
	super()

	const screenPath = `/sys/class/backlight/${this.#interface}/brightness`
	Utils.monitorFile(screenPath, () => this.#onChange())
	this.#onChange()
    }

    #onChange() {
	this.#screen_value = Math.round(get("get") / this.#screenMax * 100)

	this.emit('changed')
	this.notify('screen-value')

	this.emit('screen-changed', this.#screen_value)
    }

    connect(event = 'screen-changed', callback) {
	return super.connect(event, callback)
    }
}

export default new Brightness
