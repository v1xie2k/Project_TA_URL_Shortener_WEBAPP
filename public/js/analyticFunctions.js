function getStarted() {  
  const reportDataElement = document.getElementById('reportData');
  const reportDataString = reportDataElement.textContent;
  const reportData = JSON.parse(reportDataString);
  console.log(reportData);
  const rawReport = combineData({type: 'all'}, reportData)
  
  console.log('rawReport', rawReport);
  loadData(rawReport, {})
}

function loadData(rawReport, filter) {  
  var lineChartData = new Array(7).fill(0);
  var pieChartData = new Array(3).fill(0);
  var tableData = []
  let totalClicks = 0;
  var labelDate = filter.dateFrom ? generateNext7Days(filter.dateFrom) : generateLast7Days(new Date())
  rawReport.forEach(item => {
      for (let index = 0; index < labelDate.length; index++) {
          if(labelDate[index] == item.date){
              lineChartData[index] = item.totalClicks
              for (const country of item.countryClicks) {
                var found = false 
                for (const iterator of tableData) {
                    if(iterator.country == country.country){
                        found = true 
                        iterator.click += country.click
                    }
                }
                if(!found){
                    tableData.push({country: country.country, click: country.click})
                }
              }
              pieChartData[0] += item.deviceClicks.mobile 
              pieChartData[1] += item.deviceClicks.tablet 
              pieChartData[2] += item.deviceClicks.desktop 
              totalClicks += item.totalClicks;
          }
      }
  });

  const dataLineChart = {
      labels: labelDate,
      datasets: [{
          label: 'Clicks',
          data: lineChartData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
      }]
  }
  const dataPieChart = {
      labels: ['Mobile', 'Tablet', 'Desktop'],
      datasets: [{
          label: 'clicks',
          data: pieChartData,
          backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
          ],
          hoverOffset: 4  
      }]
  }
  
  const canvasLineChart = document.getElementById('lineChart').getContext('2d');
  const canvasPieChart = document.getElementById('pieChart').getContext('2d');
  if(Chart.getChart('lineChart') != undefined) Chart.getChart('lineChart').destroy()
  if(Chart.getChart('pieChart') != undefined) Chart.getChart('pieChart').destroy()
  const lineChart = new Chart(canvasLineChart, {
      type: 'line',
      data: dataLineChart
  });

  const pieChart = new Chart(canvasPieChart, {
      type: 'pie',
      data: dataPieChart,
      options: {   
          plugins: {
          legend: {
              display: true,
              position: 'right'
          }
          }
      }
  });
  var ctr = 1
  var htmlSyntax = ''
  tableData.forEach(item=>{
      htmlSyntax += '<tr><td>'+ctr+'</td>'+'<td>'+item.country+'</td>'+'<td>'+item.click+'</td></tr>'
      ctr++
  })
  const countryBodyTable = $('#countryBodyTable').html(htmlSyntax)
  new DataTable('#countryTable')

  //check if there's data or not
  var dataFound = false 
  lineChartData.forEach(element => {
    if(element > 0) dataFound = true
  })
  if(!dataFound){
    $('#noData').show()
    $('.contentData').hide()
  }else{
    $('#noData').hide()
    $('.contentData').show()
  }
}

function generateLast7Days(dateFilter) {
    const labels = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(dateFilter)
      date.setDate(dateFilter.getDate() - i)
      const month = date.getMonth() + 1
      const day = date.getDate()
      const year = date.getFullYear()
      labels.push(`${month}/${day}/${year}`)
    }
    return labels;
}

function generateNext7Days(dateFilter) {
  const labels = []
  for (let i = 0; i <= 6; i++) {
    const date = new Date(dateFilter)
    date.setDate(dateFilter.getDate() + i)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    labels.push(`${month}/${day}/${year}`)
  }
  return labels;
}

function combineData(filter, data) {  
  const reportData = data
  const groupedByDate = {}
  if(filter.type != 'all'){
    if(filter.type == 'url'){
      const url = reportData.url
      url.forEach(item => {
        const date = item.date;
        groupedByDate[date] = groupedByDate[date] || {
          date: date,
          totalClicks: 0,
          deviceClicks: { mobile: 0, tablet: 0, desktop: 0 },
          countryClicks: []
        };
        groupedByDate[date].totalClicks += item.totalClicks;
    
        item.deviceClicks.forEach(device => {
          groupedByDate[date].deviceClicks[device.type] += device.click;
        });
  
        item.countryClicks.forEach(country => {
          var found = false
          for (const iterator of groupedByDate[date].countryClicks) {
            if(iterator.country == country.country){
                iterator.click += country.click
                found = true
            }
          }
          if(!found){
              const countryName = country.country
              const countryClick = country.click
              groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
          }
        });
      });
    }else if(filter.type =='qr'){
      const qr = reportData.qr
      console.log(qr);
      qr.forEach(item => {
        const date = item.date;
        groupedByDate[date] = groupedByDate[date] || {
          date: date,
          totalClicks: 0,
          deviceClicks: { mobile: 0, tablet: 0, desktop: 0 },
          countryClicks: []
        };
        groupedByDate[date].totalClicks += item.totalClicks;
    
        item.deviceClicks.forEach(device => {
          groupedByDate[date].deviceClicks[device.type] += device.click;
        });
  
        item.countryClicks.forEach(country => {
          var found = false
          for (const iterator of groupedByDate[date].countryClicks) {
            if(iterator.country == country.country){
                iterator.click += country.click
                found = true
            }
          }
          if(!found){
              const countryName = country.country
              const countryClick = country.click
              groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
          }
        });
      });
    }else if(filter.type =='bio'){
      const biolink = reportData.biolink
      biolink.forEach(item => {
        const date = item.date;
        groupedByDate[date] = groupedByDate[date] || {
          date: date,
          totalClicks: 0,
          deviceClicks: { mobile: 0, tablet: 0, desktop: 0 },
          countryClicks: []
        };
        groupedByDate[date].totalClicks += item.totalClicks;
    
        item.deviceClicks.forEach(device => {
          groupedByDate[date].deviceClicks[device.type] += device.click;
        });
  
        item.countryClicks.forEach(country => {
          var found = false
          for (const iterator of groupedByDate[date].countryClicks) {
            if(iterator.country == country.country){
                iterator.click += country.click
                found = true
            }
          }
          if(!found){
              const countryName = country.country
              const countryClick = country.click
              groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
          }
        });
      });
    }
  }else{
    const url = reportData.url
    const qr = reportData.qr
    const biolink = reportData.biolink
    url.forEach(item => {
      const date = item.date;
      console.log('item url:', item);
      groupedByDate[date] = groupedByDate[date] || {
        date: date,
        totalClicks: 0,
        deviceClicks: { mobile: 0, tablet: 0, desktop: 0 },
        countryClicks: []
      };
      groupedByDate[date].totalClicks += item.totalClicks;
  
      item.deviceClicks.forEach(device => {
        groupedByDate[date].deviceClicks[device.type] += device.click;
      });

      item.countryClicks.forEach(country => {
        var found = false
        for (const iterator of groupedByDate[date].countryClicks) {
            if(iterator.country == country.country){
                iterator.click += country.click
                found = true
            }
        }
        if(!found){
            const countryName = country.country
            const countryClick = country.click
            groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
        }
      });
    });
    
    qr.forEach(item => {
      const date = item.date;
      console.log('item qr:', item);
      groupedByDate[date] = groupedByDate[date] || {
        date: date,
        totalClicks: 0,
        deviceClicks: { mobile: 0, tablet: 0, desktop: 0 },
        countryClicks: []
      };
      groupedByDate[date].totalClicks += item.totalClicks;
  
      item.deviceClicks.forEach(device => {
        groupedByDate[date].deviceClicks[device.type] += device.click;
      });

      item.countryClicks.forEach(country => {
        var found = false
        for (const iterator of groupedByDate[date].countryClicks) {
            if(iterator.country == country.country){
                iterator.click += country.click
                found = true
            }
        }
        if(!found){
            const countryName = country.country
            const countryClick = country.click
            groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
        }
      });
    });
    biolink.forEach(item => {
      const date = item.date
      groupedByDate[date] = groupedByDate[date] || {
        date: date,
        totalClicks: 0,
        deviceClicks: { mobile: 0, tablet: 0, desktop: 0 },
        countryClicks: []
      };
      groupedByDate[date].totalClicks += item.totalClicks;
  
      item.deviceClicks.forEach(device => {
        groupedByDate[date].deviceClicks[device.type] += device.click;
      });

      item.countryClicks.forEach(country => {
        var found = false
        for (const iterator of groupedByDate[date].countryClicks) {
            if(iterator.country == country.country){
                iterator.click += country.click
                found = true
            }
        }
        if(!found){
            const countryName = country.country
            const countryClick = country.click
            groupedByDate[date].countryClicks.push({country: countryName, click: countryClick})
        }
      });
    });
  }
  console.log('groupedByDate',groupedByDate);
  return Object.values(groupedByDate)
}

function changeType(e) {
  const reportDataElement = document.getElementById('reportData');
  const reportDataString = reportDataElement.textContent;
  const reportData = JSON.parse(reportDataString);
  const filter = {}
  filter.type = $(e).val()
  filter.dateFrom = new Date($('#dateAnchor').val())
  const rawReport = combineData(filter, reportData)
  loadData(rawReport, filter)
}

async function dateChange(e){
  const reportDataElement = document.getElementById('reportData');
  const reportDataString = reportDataElement.textContent;
  const reportData = JSON.parse(reportDataString);
  const dateAnchor =  $(e).val();
  const filter = {}
  filter.dateFrom = new Date(dateAnchor)
  filter.type = $('#filterType').val()
  
  const rawReport = await combineData(filter, reportData)
  loadData(rawReport, filter)
}