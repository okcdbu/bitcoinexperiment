$(document).ready(function(){
				var sock = io.connect('http://' + document.domain + ':' + location.port);
				console.log('ready...')
				sock.on( 'response' , function(dt){
					console.log('connected!')
					console.log(JSON.parse(dt))
					var chartdata = [];
					$.each(JSON.parse(dt), function(i, item){
						chartdata.push([item.date, item.open, item.high, item.low, item.close]);
						//console.log(item.date)
						});
					chartfs.series[0].setData(chartdata);
				});
					var unit = [
										[
											'minute',
											[30]
										],
										[
    										'hour',
   											[1, 2, 3, 4, 6, 8, 12]
										],
										[
											'day',
											[1]
										],
										[
											'week',
											[1]
										],
										[
											'month',
											[1, 3, 6]
										],
									]
					var chartfs = new Highcharts.stockChart('container',{
						chart:{
							type: 'candlestick',
						},
						title: {
							text: 'BTC/KRW'
						},
						subtitle: {
							text: 'Bitcoin chart per 1 min'
						},
						rangeSelector: {
							buttons: [
								{type: 'day',count: 1,text: '1d'},
								{type: 'all',count: 1,text: 'All'}
							],
							selected: 1,
							inputEnabled: true
						},
						xAxis: {
							ordinal: false,
							units : unit,
							minTickInterval : 30 * 60 * 1000
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
						time: {
							timezoneOffset : -9 * 60
						},
						series: [
							{
								name: 'BTC/KRW',
								type: 'candlestick',
								data: [],
								id: 'BTC',
								dataGrouping: {
									forced : true,
									units : unit
								},
								pointIntervalUnit: unit
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
     							},
								pointIntervalUnit: unit,
									dataGrouping: {
									forced : true,
									units : unit
									}
								},


							{
								name: 'Bollinger Band',
								type: 'bb',
								linkedTo: 'BTC',
								pointIntervalUnit : unit,

									dataGrouping: {
									forced : true,
									units : unit
								}
							}
						]
					});

					sock.on('ohlcv',function(dt){
						var jsondt = JSON.parse(dt)
						var last = chartfs.series[0].xData[chartfs.series[0].xData.length - 1]
						var dataarr = chartfs.series[0]
						//console.log('last data:'+new Date(last),dataarr.options.data.length)
						if(jsondt.date < last + 1000 * 60 * 30){
							chartfs.series[0].removePoint(dataarr.options.data.length - 1)
							chartfs.series[0].addPoint([
							jsondt.date,
							+jsondt.open,
							+jsondt.high,
							+jsondt.low,
							+jsondt.close
            			])
						}
						else{
							chartfs.series[0].addPoint([
							jsondt.date,
							+jsondt.open,
							+jsondt.high,
							+jsondt.low,
							+jsondt.close
            			])
						}

					})


			});
