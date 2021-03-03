export const singleViewFragment = `
	fragment SingleView on SingleView {
		original
		description
		uid
		width
		height
		thumb
		hires
		title
		levels
		medium
		averageColor{
			r
			g
			b
		}
		colors {
			edges {
				node {
					column {
						edges {
							node {
								r
								g
								b
							}
						}
					}
				}
			}
		}
	}
`
export const predictionFragment = `
	fragment PredictionFragment on PredictionConnection {
		edges {
			node {
				rating
				stno
				street
				styp
				city
				st
				zip
			}
		}
	}
`
