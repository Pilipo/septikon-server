document.write("generatorURL = https://beta5.objgen.com/json<br>")
document.write("generatorURL = https://jsfiddle.net/jmnksb9p/23/<br>")
for (i = 0; i < 31; i++) {
    document.write(i + "<br>")
    document.write("&nbsp;&nbsp;properties o<br>")
    for (j = 0; j < 21; j++) {
        document.write("&nbsp;&nbsp;" + j + "<br>")
        if ((i > -1 && i < 2) || (i > 28 && i < 31)) {
            if (j == 10 && (i == 1 || i == 29)) {
                document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = lock<br>")
            } else {
                document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = production<br>")
            }
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "name = PENDING<br>")
        }
        if ((i > 1 && i < 6) || (i > 24 && i < 29)) {
            if (j === 10) {
                if (i == 25 || i == 5) {
                    document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = lock<br>")
                } else {
                    document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = armory<br>")
                }
            } else {
                document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = resource<br>")
            }
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "name = PENDING<br>")
        }
        if ((i > 5 && i < 8) || (i > 22 && i < 25)) {
            if ((j == 0 || j == 20) && (i == 7 || i == 23)) {
                document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = lock<br>")
            } else {
                document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = battle<br>")
            }
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "name = PENDING<br>")
        }
        if ((i == 8) || (i == 22)) {
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = surface<br>")
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "name = PENDING<br>")
        }
        if (i > 8 && i < 22) {
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "type = space<br>")
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "name = space<br>")
        }
        if (i < 9) {
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "owner = 1<br>")
        } else if (i > 21) {
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "owner = 2<br>")
        } else {
            document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "owner = 0<br>")
        }

        document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "resourceCostType[] n = null<br>")
        document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "resourceCostCount[] n = 0<br>")
        document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "resourceYieldType[] n = null<br>")
        document.write("&nbsp;&nbsp;&nbsp;&nbsp;" + "resourceYieldCount[] n = 0<br>")
    }
}