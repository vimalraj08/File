/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22"], "isController": false}, {"data": [0.25, 500, 1500, "4 /"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "153 /wp-content/uploads/2019/06/popup-close-btn.svg"], "isController": false}, {"data": [0.0, 500, 1500, "Launch Page"], "isController": true}, {"data": [0.0, 500, 1500, "Quality Engineering Page"], "isController": true}, {"data": [1.0, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "301 /quality-engineering/"], "isController": false}, {"data": [1.0, 500, 1500, "124 /wp-content/uploads/2019/05/Sprite_Sheet-2.svg"], "isController": false}, {"data": [1.0, 500, 1500, "152 /wp-content/uploads/2019/04/title-after-bg.svg"], "isController": false}, {"data": [0.25, 500, 1500, "146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-0"], "isController": false}, {"data": [0.5, 500, 1500, "146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 20, 0, 0.0, 1144.5, 0, 3890, 3248.4000000000005, 3859.2999999999997, 3890.0, 1.1223974409338346, 187.63043485885854, 0.4376692364891408], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22", 2, 0, 0.0, 2635.5, 2319, 2952, 2952.0, 2952.0, 2952.0, 0.19164430816404754, 11.48930085760828, 0.16375856410502107], "isController": false}, {"data": ["4 /", 2, 0, 0.0, 1989.5, 979, 3000, 3000.0, 3000.0, 3000.0, 0.17362618282837053, 128.15952176838266, 0.07613101180658043], "isController": false}, {"data": ["Debug Sampler", 2, 0, 0.0, 1.0, 0, 2, 2.0, 2.0, 2.0, 0.291247997670016, 0.3061801459880588, 0.0], "isController": false}, {"data": ["153 /wp-content/uploads/2019/06/popup-close-btn.svg", 2, 0, 0.0, 86.5, 83, 90, 90.0, 90.0, 90.0, 0.2439619419370578, 0.21179899060746524, 0.10173022383508172], "isController": false}, {"data": ["Launch Page", 2, 0, 0.0, 5063.5, 3556, 6571, 6571.0, 6571.0, 6571.0, 0.14122299110295156, 113.48322370163112, 0.35898774007908485], "isController": true}, {"data": ["Quality Engineering Page", 2, 0, 0.0, 3583.0, 3276, 3890, 3890.0, 3890.0, 3890.0, 0.1858390633711206, 149.99372067227281, 0.09346398206653038], "isController": true}, {"data": ["JSR223 Sampler", 2, 0, 0.0, 163.5, 1, 326, 326.0, 326.0, 326.0, 0.18254837531945967, 0.0, 0.0], "isController": false}, {"data": ["301 /quality-engineering/", 2, 0, 0.0, 3583.0, 3276, 3890, 3890.0, 3890.0, 3890.0, 0.185821796896776, 149.97978462092354, 0.09345529824398402], "isController": false}, {"data": ["124 /wp-content/uploads/2019/05/Sprite_Sheet-2.svg", 2, 0, 0.0, 253.0, 83, 423, 423.0, 423.0, 423.0, 0.23304591004427874, 0.8735807868212537, 0.09695073992076438], "isController": false}, {"data": ["152 /wp-content/uploads/2019/04/title-after-bg.svg", 2, 0, 0.0, 99.0, 85, 113, 113.0, 113.0, 113.0, 0.2426301103967002, 0.21159051619555985, 0.10093791702050224], "isController": false}, {"data": ["146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-0", 2, 0, 0.0, 1557.0, 1379, 1735, 1735.0, 1735.0, 1735.0, 0.21061499578770007, 0.09810874315501263, 0.09029295229570344], "isController": false}, {"data": ["146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-1", 2, 0, 0.0, 1077.0, 940, 1214, 1214.0, 1214.0, 1214.0, 0.22993791676247413, 13.677937816164635, 0.09790325362152219], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 20, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
