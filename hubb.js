var viewType = "Nyhetsbrev";

const textRight1 = '<div id="';
const textRight2 = '" class="item-section ';
const textRight3 = '">\
        <div class="selectors"><button class="hide">Göm/Visa</button><button class="choose">Välj</button></div>\
        <div class="text-wrapper">\
            <span class="label">';
    const textRight4 = '</span><span href="';
    const textRight5 = '" class="">\
                <h3>';
    const textRight6 = '</h3>\
            </span>\
            <div class="content">\
            <span class="text-wrapper__meta-info">'
    const textRight7 = '</span><p>';
    const textRight8 = '</p><span class="campaign-label">';
    const textRight9 = '</span><button class="show-content">+/-</button>\
            <span class="text-wrapper__text"  style="display:none;"">';
    const textRight10 = '</span>\
                </div>\
        </div>\
    </div>';

    var client = contentful.createClient({
        space: 'pcxm38nqfovc',
        accessToken: '4rrfDmsmeP1UXiGkjP_qOnTuhENMmgCsamsy-4mUpU4'
    });

    function addListEventListeners()
    {

        $(".choose").click(function(e) {
            var listId = e.target.parentNode.parentNode.parentNode.id;
            var listTagId = listId == "nyhetsbrev" ? "nyhetslista" : "nyhetsbrev";
            var $itemHtml = $(e.target.parentNode.parentNode);
            e.target.parentNode.parentNode.outerHTML = "";
            $("#"+ listTagId).prepend($itemHtml);
        });

        $(".hide").click(function(e) {
            $item = $(e.target.parentNode.parentNode);
            $item.toggleClass("hidden")
            $item.find(".choose").toggle();
            $item.find(".content").toggle();
        });

        $(".show-content").click(function(e) {
            $item = $(e.target).next().toggle();
        })

        $("#mark-as-done").click(function(e) {
            $("#nyhetsbrev").html("");
        })

        $("#mark-hidden-as-done").click(function(e) {
            $("#nyhetslista").find(".hidden").remove();
        })
        

    }

    function fetchEntries() {
        // Nyhetsbrev
        // LinkedIn

        var channelSelections = "nyhetsbrev";
        $("#source-heading").text("Kandidater att ta med i nyhetsbrev");
        $("#report-heading").text("Underlag till nyhetsbrev");
        $("#linkedin-logo").hide();

        if(viewType == "LinkedIn") {
            channelSelections = "linkedIn"
            $("#source-heading").text("Kandidater att visa på LinkedIn");
            $("#report-heading").text("Material till LinkedIn");
            $("#linkedin-logo").show();
        }

        client.getEntries(
            {
            'sys.contentType.sys.id[in]': "nyhet,erbjudande,webbsida",
            'metadata.tags.sys.id[in]': channelSelections
        }
        ).then(function (entries) {
            // log the title for all the entries that have it
            entries.items.forEach(function (entry) {
                var cssklass = '';
                var utmlankUrl = '';
                var utmlankText = '';
                var etikett = '';
                var rubrik = '';
                var contentHtml = '';
                var puffText = '';
                var someText = '';
                var someTextHtml = '';
                var kampanjreferenser = null;
                if (entry.sys.contentType.sys.id == 'nyhet') {
                    cssklass = "item-news";
                    etikett = "Nyhet";
                    rubrik = entry.fields.rubrik;
                    contentHtml = documentToHtmlString(entry.fields.beskrivning);
                    puffText = entry.fields.pufftext ?? $(contentHtml).text();
                    someText = entry.fields.someText ?? "";
                    kampanjreferenser = entry.fields.kampanjreferenser;
                    utmlankText = entry.fields.rubrik;
                    utmlankUrl = "http://vinnova.se/nyheter/" + entry.sys.id + "/";
                } else if(entry.sys.contentType.sys.id == 'erbjudande') {
                    cssklass = "item-offering";
                    etikett = "Erbjudande";
                    rubrik = entry.fields.rubrik;
                    var vad = entry.fields.vad ?? "";
                    var vem = entry.fields.vad ?? ""; 
                    var hurMycket = entry.fields.hurMycket ?? ""; 
                    contentHtml = "<p><h3>Vad</h3>" + vad + "</p><h3>Vem</h3><p>" + vem + "</p><h3>Hur mycket</h3><p>"+ hurMycket +"</p>";
                    puffText = entry.fields.pufftext ?? $(contentHtml).text().substring(0, 300);
                    someText = entry.fields.someText ?? "";
                    kampanjreferenser = entry.fields.kampanjreferenser;
                    utmlankText = entry.fields.rubrik;
                    utmlankUrl = "http://vinnova.se/e/" + entry.fields.diarienummer + "/";
                } else if(entry.sys.contentType.sys.id == 'webbsida') {
                    cssklass = "item-webpage";
                    etikett = "Webbsida";
                    rubrik = entry.fields.rubrik;
                    contentHtml = documentToHtmlString(entry.fields.sidinnehall);
                    puffText = entry.fields.pufftext ?? $(contentHtml).text().substring(0, 300);
                    someText = entry.fields.someText ?? "";
                    kampanjreferenser = entry.fields.kampanjreferenser;
                    utmlankText = entry.fields.rubrik;
                    utmlankUrl = "http://vinnova.se/entries/"  + entry.sys.id + "/";
                }


                var kampanjNamn = "";
                if(kampanjreferenser && kampanjreferenser.length > 0) {
                    kampanjreferenser.forEach(function(childEntry) {
                        kampanjNamn += childEntry.fields. kampanjnamn + ", ";
                    })
                    kampanjNamn = kampanjNamn.substring(0,kampanjNamn.length-2);

                    utmlankUrl += "?mtm_campaign=" + kampanjreferenser[0].fields.kampanjid;
                }
                else {
                    kampanjNamn = "Utanför kampanj";
                }

                var utmlankarHtml = (utmlankUrl && utmlankText) ? "<span class='utm-links'><span>Länkar och UTM-länkar</span><br /><a href='" + utmlankUrl + "'>" + utmlankText + "</a> <button class='copy-button'>Kopiera</button> ("+ utmlankUrl + ")</span>" : "";

                var updateDate = new Date(entry.sys.updatedAt);
                var year = updateDate.getFullYear();
                var month = updateDate.getMonth() < 10 ? "0" + updateDate.getMonth() : updateDate.getMonth();
                var day = updateDate.getDay() < 10 ? "0" + updateDate.getDay() : updateDate.getDay();
                var datum = year + "-" + month + "-" + day;

                if(viewType == "LinkedIn") {
                    someTextHtml =  "<br /><span class='sometext'>Some: " + someText + "</span>";
                } 
                var textRight = textRight1 + entry.sys.id + 
                    textRight2 + cssklass +
                    textRight3 + etikett + " " + datum +
                    textRight4 + "#" + 
                    textRight5 + rubrik + " <button class='copy-button'>Kopiera</button>" +
                    textRight6 + "" + 
                    textRight7 + puffText + " <button class='copy-button'>Kopiera</button>" + someTextHtml +
                    textRight8 + kampanjNamn +
                    textRight9 + utmlankarHtml + contentHtml +
                    textRight10;
                $("#nyhetslista").prepend(textRight);
                
            });

            addListEventListeners();
        });
    }
    
    $(document).ready(function() {
        $("h1").click(function() {
            if(viewType == "Nyhetsbrev") {
                viewType = "LinkedIn";
                $(".cell-a").css("background-color", "#0073B2");
            } else {
                viewType = "Nyhetsbrev";
                $(".cell-a").css("background-color", "#ffffff");
            }         
            $("#nyhetslista").html("");
            $("#nyhetsbrev").html("");
            

            fetchEntries();       
        })


        fetchEntries();
    });

