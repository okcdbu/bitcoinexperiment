function myFunc(vars) {
    return vars
}
function draw3(){
				var chartdata = [];

				$.each(df, function(i, item){
					chartdata.push([item.date, item.open, item.high, item.low, item.close]);
				});

					Highcharts.stockChart('container',{
						title: {
							text: 'BTC/KRW'
						},
						subtitle: {
							text: 'Bitcoin chart per 1 min'
						},
						rangeSelector: {
							buttons: [
								{type: 'hour',count: 1,text: '1h'},
								{type: 'day',count: 1,text: '1d'},
								{type: 'all',count: 1,text: 'All'}
							],
							selected: 2,
							inputEnabled: true
						},
						plotOptions: {
							candlestick: {
								downColor: 'blue',
								upColor: 'red'
							},
							bb: {
								bottomLine: {
									styles: {
										lineColor: 'red'
									}
								},
								topLine: {
									styles: {
										lineColor: 'blue'
									}
								}
							}
						},
						series: [
							{
								name: 'BTC/KRW',
								type: 'candlestick',
								data: chartdata,
								id: 'BTC',
								tooltip: {
								valueDecimals: 8
								}
							},
							{
								name: 'MA20',
								type: 'sma',
								linkedTo: 'BTC',
								params: {
									index: 3,
									period: 20
								},
								marker: {
        							enabled: false
     							}
							},
							{
								name: 'Bollinger Band',
								type: 'bb',
								linkedTo: 'BTC'
							}
						]
					});

			}
			draw3();