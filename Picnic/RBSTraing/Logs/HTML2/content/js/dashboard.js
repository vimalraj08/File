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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5681818181818182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22"], "isController": false}, {"data": [0.25, 500, 1500, "4 /"], "isController": false}, {"data": [1.0, 500, 1500, "153 /wp-content/uploads/2019/06/popup-close-btn.svg"], "isController": false}, {"data": [0.0, 500, 1500, "Launch Page"], "isController": true}, {"data": [0.5, 500, 1500, "Quality Engineering Page"], "isController": true}, {"data": [1.0, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [0.5, 500, 1500, "301 /quality-engineering/"], "isController": false}, {"data": [1.0, 500, 1500, "124 /wp-content/uploads/2019/05/Sprite_Sheet-2.svg"], "isController": false}, {"data": [1.0, 500, 1500, "152 /wp-content/uploads/2019/04/title-after-bg.svg"], "isController": false}, {"data": [0.5, 500, 1500, "146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-0"], "isController": false}, {"data": [0.5, 500, 1500, "146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 18, 0, 0.0, 857.7777777777778, 1, 2828, 2405.9000000000005, 2828.0, 2828.0, 1.661436219309581, 73.44770369900314, 0.7198475286136238], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22", 2, 0, 0.0, 2353.0, 1878, 2828, 2828.0, 2828.0, 2828.0, 0.24310198128114743, 14.574248662939102, 0.20772874377051173], "isController": false}, {"data": ["4 /", 2, 0, 0.0, 1268.0, 827, 1709, 1709.0, 1709.0, 1709.0, 0.25009378516943853, 32.24085008440665, 0.10966026322370889], "isController": false}, {"data": ["153 /wp-content/uploads/2019/06/popup-close-btn.svg", 2, 0, 0.0, 83.0, 81, 85, 85.0, 85.0, 85.0, 0.3110419906687403, 0.27003547822706064, 0.1297020800933126], "isController": false}, {"data": ["Launch Page", 2, 0, 0.0, 3902.5, 3022, 4783, 4783.0, 4783.0, 4783.0, 0.1953315753491552, 37.96356913516945, 0.49653133850962006], "isController": true}, {"data": ["Quality Engineering Page", 2, 0, 0.0, 1356.0, 353, 2359, 2359.0, 2359.0, 2359.0, 0.3477656059815684, 49.92542057902973, 0.17490164753955834], "isController": true}, {"data": ["JSR223 Sampler", 2, 0, 0.0, 113.0, 1, 225, 225.0, 225.0, 225.0, 0.26852846401718583, 0.0, 0.0], "isController": false}, {"data": ["301 /quality-engineering/", 2, 0, 0.0, 1356.0, 353, 2359, 2359.0, 2359.0, 2359.0, 0.3477656059815684, 49.92542057902973, 0.17490164753955834], "isController": false}, {"data": ["124 /wp-content/uploads/2019/05/Sprite_Sheet-2.svg", 2, 0, 0.0, 100.5, 84, 117, 117.0, 117.0, 117.0, 0.31269543464665417, 1.1719971466541588, 0.1300861866791745], "isController": false}, {"data": ["152 /wp-content/uploads/2019/04/title-after-bg.svg", 2, 0, 0.0, 98.0, 81, 115, 115.0, 115.0, 115.0, 0.31123560535325245, 0.2714193316215375, 0.12947887488328663], "isController": false}, {"data": ["146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-0", 2, 0, 0.0, 1384.5, 1302, 1467, 1467.0, 1467.0, 1467.0, 0.26140373807345446, 0.12176717095804471, 0.11206664161547511], "isController": false}, {"data": ["146 /wp-content/uploads/2021/08/wealth-management-home-1.jpg%22-1", 2, 0, 0.0, 964.0, 576, 1352, 1352.0, 1352.0, 1352.0, 0.2962524070508073, 17.622678584654125, 0.12613872018960154], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 18, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
