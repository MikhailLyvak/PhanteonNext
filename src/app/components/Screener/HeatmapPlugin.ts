import type {
	CustomData,
	CustomSeriesOptions,
	CustomSeriesPricePlotValues,
	ICustomSeriesPaneRenderer,
	ICustomSeriesPaneView,
	PaneRendererCustomData,
	PriceToCoordinateConverter,
	Time,
} from 'lightweight-charts'

export interface HeatmapCell {
	price: number
	b: number
	s: number
}

export interface HeatmapDatum extends CustomData<Time> {
	cells: HeatmapCell[]
	minPrice: number
	maxPrice: number
}

export interface HeatmapSeriesOptions extends CustomSeriesOptions {
	cellHeight: number
}

const defaultOptions: HeatmapSeriesOptions = {
	cellHeight: 4,
	lastValueVisible: false,
	priceLineVisible: false,
	visible: true,
	priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
	priceScaleId: 'right',
	title: '',
} as unknown as HeatmapSeriesOptions

class HeatmapRenderer implements ICustomSeriesPaneRenderer {
	private _data: PaneRendererCustomData<Time, HeatmapDatum> | null = null
	private _options: HeatmapSeriesOptions = defaultOptions

	update(
		data: PaneRendererCustomData<Time, HeatmapDatum>,
		options: HeatmapSeriesOptions
	): void {
		this._data = data
		this._options = options
	}

	draw(
		target: { useBitmapCoordinateSpace: (cb: (scope: { context: CanvasRenderingContext2D; horizontalPixelRatio: number; verticalPixelRatio: number }) => void) => void },
		priceConverter: PriceToCoordinateConverter
	): void {
		const data = this._data
		if (!data || data.bars.length === 0) return

		target.useBitmapCoordinateSpace(scope => {
			const ctx = scope.context
			const hr = scope.horizontalPixelRatio
			const vr = scope.verticalPixelRatio
			const barW = Math.max(2, data.barSpacing * hr * 0.95)
			const cellH = Math.max(1, this._options.cellHeight * vr)

			for (const bar of data.bars) {
				const datum = bar.originalData
				if (!datum || !datum.cells || datum.cells.length === 0) continue
				const cx = bar.x * hr - barW / 2
				for (const cell of datum.cells) {
					const yCoord = priceConverter(cell.price)
					if (yCoord === null) continue
					const y = yCoord * vr - cellH / 2
					const total = cell.b + cell.s
					if (total <= 0) continue
					const bFrac = cell.b / total
					const sFrac = cell.s / total
					const alphaB = Math.min(0.85, 0.15 + bFrac * 0.7)
					const alphaS = Math.min(0.85, 0.15 + sFrac * 0.7)
					if (cell.b > cell.s) {
						ctx.fillStyle = `rgba(74,222,128,${alphaB})`
					} else {
						ctx.fillStyle = `rgba(248,113,113,${alphaS})`
					}
					ctx.fillRect(cx, y, barW, cellH)
				}
			}
		})
	}
}

export class HeatmapSeriesView
	implements ICustomSeriesPaneView<Time, HeatmapDatum, HeatmapSeriesOptions>
{
	private _renderer = new HeatmapRenderer()

	renderer(): ICustomSeriesPaneRenderer {
		return this._renderer
	}

	update(
		data: PaneRendererCustomData<Time, HeatmapDatum>,
		options: HeatmapSeriesOptions
	): void {
		this._renderer.update(data, options)
	}

	priceValueBuilder(plotRow: HeatmapDatum): CustomSeriesPricePlotValues {
		return [plotRow.minPrice, plotRow.maxPrice, plotRow.maxPrice]
	}

	isWhitespace(data: HeatmapDatum | { time: Time }): data is { time: Time } {
		return !('cells' in data) || (data as HeatmapDatum).cells.length === 0
	}

	defaultOptions(): HeatmapSeriesOptions {
		return defaultOptions
	}
}
