"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     */
    await queryInterface.bulkInsert(
      "Suppliers",
      [
        {
          name: "Eayo",
          contact: "Tomasina Wanden",
          email: "twanden0@npr.org",
          phone: "839-265-9013",
          address: "93872 Graceland Alley",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Skiptube",
          contact: "Ansley Perfili",
          email: "aperfili1@phoca.cz",
          phone: "794-145-3624",
          address: "830 Harper Street",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Buzzbean",
          contact: "Melesa Clyde",
          email: "mclyde2@ox.ac.uk",
          phone: "189-755-3180",
          address: "9 Glendale Plaza",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Twinte",
          contact: "Nita Beardall",
          email: "nbeardall3@redcross.org",
          phone: "888-338-9394",
          address: "61 Stuart Crossing",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Riffpath",
          contact: "Stacia Benko",
          email: "sbenko4@uiuc.edu",
          phone: "483-879-5016",
          address: "0982 Bay Road",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Twitterwire",
          contact: "Sheeree Poulston",
          email: "spoulston5@accuweather.com",
          phone: "535-912-8960",
          address: "08 Iowa Plaza",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Roombo",
          contact: "Leland Borrows",
          email: "lborrows6@google.co.jp",
          phone: "837-604-9075",
          address: "89625 Melody Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Gabtype",
          contact: "Cornelius Conniam",
          email: "cconniam7@mac.com",
          phone: "676-350-3045",
          address: "06762 Fisk Place",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Yacero",
          contact: "Sam Dallinder",
          email: "sdallinder8@over-blog.com",
          phone: "602-534-5164",
          address: "5181 Warner Crossing",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Viva",
          contact: "Karin Bassick",
          email: "kbassick9@mayoclinic.com",
          phone: "840-109-5123",
          address: "6 Westport Lane",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Wordpedia",
          contact: "Nyssa Woodvine",
          email: "nwoodvinea@stumbleupon.com",
          phone: "751-948-0201",
          address: "7740 Amoth Terrace",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kimia",
          contact: "Daune Winnard",
          email: "dwinnardb@freewebs.com",
          phone: "960-824-3857",
          address: "5940 Pleasure Trail",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Zoombeat",
          contact: "Alejandrina Dumbell",
          email: "adumbellc@blog.com",
          phone: "402-202-5555",
          address: "14007 Lukken Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Fivebridge",
          contact: "Annissa Burborough",
          email: "aburboroughd@howstuffworks.com",
          phone: "611-501-8783",
          address: "054 Susan Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Buzzbean",
          contact: "Rhianna Filippone",
          email: "rfilipponee@mayoclinic.com",
          phone: "910-831-8353",
          address: "41 Dakota Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Edgeify",
          contact: "Hernando Huncoot",
          email: "hhuncootf@goo.ne.jp",
          phone: "559-597-9052",
          address: "6156 Hoepker Road",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Gabtype",
          contact: "Barby Witherspoon",
          email: "bwitherspoong@barnesandnoble.com",
          phone: "908-872-6376",
          address: "44859 Pennsylvania Parkway",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Aimbo",
          contact: "Conan Tzarkov",
          email: "ctzarkovh@ftc.gov",
          phone: "675-455-2222",
          address: "8 Annamark Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Photobug",
          contact: "Elora Simonassi",
          email: "esimonassii@salon.com",
          phone: "329-696-2294",
          address: "2038 Monterey Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Twimbo",
          contact: "Addia Carnall",
          email: "acarnallj@sogou.com",
          phone: "302-508-3446",
          address: "2679 Di Loreto Alley",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tambee",
          contact: "Nanine Pallent",
          email: "npallentk@ox.ac.uk",
          phone: "673-764-6971",
          address: "98 Canary Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kamba",
          contact: "Paco Abdee",
          email: "pabdeel@blogger.com",
          phone: "603-717-6862",
          address: "84 Southridge Pass",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tagcat",
          contact: "Taffy Addekin",
          email: "taddekinm@bbb.org",
          phone: "254-848-5434",
          address: "09868 Gerald Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Centizu",
          contact: "Levon Keller",
          email: "lkellern@w3.org",
          phone: "642-210-7759",
          address: "1717 Vidon Plaza",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bubblemix",
          contact: "Gweneth Staniforth",
          email: "gstanifortho@archive.org",
          phone: "857-465-5011",
          address: "198 Novick Trail",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Rooxo",
          contact: "Cyb McCraw",
          email: "cmccrawp@behance.net",
          phone: "864-137-9649",
          address: "68431 Dixon Alley",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jetpulse",
          contact: "Amandy Musgrove",
          email: "amusgroveq@webs.com",
          phone: "903-962-2962",
          address: "8 Upham Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Edgeify",
          contact: "Orv Poli",
          email: "opolir@illinois.edu",
          phone: "797-878-8025",
          address: "47592 Scott Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Mynte",
          contact: "Norean Duly",
          email: "ndulys@hibu.com",
          phone: "312-986-5488",
          address: "784 Blaine Lane",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Topiclounge",
          contact: "Valma Chatten",
          email: "vchattent@slashdot.org",
          phone: "558-343-9322",
          address: "40740 Grayhawk Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Topiczoom",
          contact: "Chaim Dunniom",
          email: "cdunniomu@mediafire.com",
          phone: "981-505-9626",
          address: "02272 Raven Street",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Yacero",
          contact: "Grange Tinton",
          email: "gtintonv@quantcast.com",
          phone: "163-752-0363",
          address: "84293 Warbler Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ailane",
          contact: "Franny Godfery",
          email: "fgodferyw@e-recht24.de",
          phone: "398-548-7737",
          address: "712 Shoshone Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kayveo",
          contact: "Alane Robertacci",
          email: "arobertaccix@nps.gov",
          phone: "502-324-2248",
          address: "718 Elmside Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Realcube",
          contact: "Barnaby Menel",
          email: "bmenely@rakuten.co.jp",
          phone: "470-406-2420",
          address: "3724 Arrowood Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Rooxo",
          contact: "Enrichetta Dyers",
          email: "edyersz@usgs.gov",
          phone: "129-149-7310",
          address: "740 Nobel Junction",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Einti",
          contact: "Alanna Maycock",
          email: "amaycock10@answers.com",
          phone: "529-212-6664",
          address: "04451 Park Meadow Park",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Edgepulse",
          contact: "Giulietta Doulton",
          email: "gdoulton11@twitpic.com",
          phone: "429-880-9325",
          address: "84 Oak Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Voolith",
          contact: "Dolph Gruby",
          email: "dgruby12@miitbeian.gov.cn",
          phone: "303-138-9917",
          address: "0 Corben Street",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Thoughtworks",
          contact: "Lucie Freestone",
          email: "lfreestone13@si.edu",
          phone: "431-767-1703",
          address: "76628 Talmadge Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Divape",
          contact: "Ransell Bricham",
          email: "rbricham14@paginegialle.it",
          phone: "805-297-5156",
          address: "7 South Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Dablist",
          contact: "Rita Symson",
          email: "rsymson15@mapquest.com",
          phone: "619-607-5503",
          address: "9 Continental Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Flipstorm",
          contact: "Joellen Kyle",
          email: "jkyle16@de.vu",
          phone: "593-477-4720",
          address: "7 Longview Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tazz",
          contact: "Caddric Nobes",
          email: "cnobes17@icio.us",
          phone: "999-252-6725",
          address: "4277 Randy Trail",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Gabcube",
          contact: "Creight Guidera",
          email: "cguidera18@google.com",
          phone: "791-849-4174",
          address: "68 Rusk Road",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Blognation",
          contact: "Retha Ketton",
          email: "rketton19@i2i.jp",
          phone: "772-345-3239",
          address: "02979 Victoria Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Buzzdog",
          contact: "Naomi Incogna",
          email: "nincogna1a@360.cn",
          phone: "874-477-4357",
          address: "0 Fuller Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Skippad",
          contact: "Broderick Flannigan",
          email: "bflannigan1b@macromedia.com",
          phone: "907-213-3067",
          address: "582 Loomis Terrace",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Trilia",
          contact: "Roberta Mallall",
          email: "rmallall1c@nhs.uk",
          phone: "699-639-3816",
          address: "86548 Brown Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Yoveo",
          contact: "Jada Malham",
          email: "jmalham1d@google.pl",
          phone: "765-918-2498",
          address: "8 Bartelt Junction",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Twitterbridge",
          contact: "Fidela Gascone",
          email: "fgascone1e@yale.edu",
          phone: "434-919-7166",
          address: "6 Prairie Rose Street",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Zooveo",
          contact: "Babbie Impy",
          email: "bimpy1f@furl.net",
          phone: "536-332-7950",
          address: "578 Laurel Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Linklinks",
          contact: "Aidan McCreadie",
          email: "amccreadie1g@va.gov",
          phone: "216-636-2362",
          address: "47 Sundown Lane",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Oyoyo",
          contact: "Melessa Tague",
          email: "mtague1h@archive.org",
          phone: "879-762-3671",
          address: "95 Montana Junction",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Fiveclub",
          contact: "Garrot Louth",
          email: "glouth1i@army.mil",
          phone: "822-931-4540",
          address: "3 Mariners Cove Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "JumpXS",
          contact: "Lotte Vinnick",
          email: "lvinnick1j@kickstarter.com",
          phone: "854-249-6169",
          address: "39682 Porter Point",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jatri",
          contact: "Cherye Dowry",
          email: "cdowry1k@dion.ne.jp",
          phone: "219-541-2756",
          address: "28029 Northport Parkway",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Yodo",
          contact: "Lib Emmett",
          email: "lemmett1l@alibaba.com",
          phone: "749-819-5967",
          address: "2 Northridge Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Oozz",
          contact: "Salomo Ruskin",
          email: "sruskin1m@google.pl",
          phone: "415-258-1870",
          address: "325 Dryden Circle",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Photolist",
          contact: "Randie Goodered",
          email: "rgoodered1n@cnn.com",
          phone: "542-778-6416",
          address: "3179 Mallory Plaza",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Shuffledrive",
          contact: "Natty Lerohan",
          email: "nlerohan1o@irs.gov",
          phone: "952-275-4160",
          address: "490 Mitchell Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Cogidoo",
          contact: "Matt Vause",
          email: "mvause1p@abc.net.au",
          phone: "626-724-3325",
          address: "16468 Heffernan Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Flipopia",
          contact: "Ivor Destouche",
          email: "idestouche1q@spotify.com",
          phone: "332-676-1985",
          address: "432 Gateway Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Zoomdog",
          contact: "Rees Ganiford",
          email: "rganiford1r@discovery.com",
          phone: "626-805-4472",
          address: "5910 Jana Place",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Avamba",
          contact: "Nels Amor",
          email: "namor1s@webnode.com",
          phone: "583-382-6420",
          address: "97278 Northwestern Court",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Plajo",
          contact: "Giustino Shay",
          email: "gshay1t@miibeian.gov.cn",
          phone: "433-634-4103",
          address: "51 Northland Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Muxo",
          contact: "Ruperta Caldecourt",
          email: "rcaldecourt1u@mozilla.org",
          phone: "480-311-2036",
          address: "76 Melody Court",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ooba",
          contact: "Mari Pietron",
          email: "mpietron1v@rakuten.co.jp",
          phone: "525-786-5218",
          address: "706 Reindahl Circle",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Yambee",
          contact: "Carmelita Stonestreet",
          email: "cstonestreet1w@virginia.edu",
          phone: "860-974-8897",
          address: "2812 Orin Street",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Jayo",
          contact: "Johnnie Headingham",
          email: "jheadingham1x@google.cn",
          phone: "462-393-6963",
          address: "4177 Gerald Park",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kwilith",
          contact: "Petra Millett",
          email: "pmillett1y@technorati.com",
          phone: "832-320-8861",
          address: "914 Hagan Pass",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Realmix",
          contact: "Caroline Culpen",
          email: "cculpen1z@addthis.com",
          phone: "504-212-6399",
          address: "11 Aberg Alley",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Babbleblab",
          contact: "Joe MacHostie",
          email: "jmachostie20@independent.co.uk",
          phone: "508-726-1645",
          address: "09 Arizona Circle",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Skyndu",
          contact: "Randee Noton",
          email: "rnoton21@economist.com",
          phone: "625-171-7557",
          address: "0358 Independence Terrace",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Buzzshare",
          contact: "Celeste Steuart",
          email: "csteuart22@theatlantic.com",
          phone: "533-613-5437",
          address: "76381 Cardinal Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Demimbu",
          contact: "Natassia Crotty",
          email: "ncrotty23@home.pl",
          phone: "419-476-9313",
          address: "353 Ohio Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kimia",
          contact: "Dugald Bleby",
          email: "dbleby24@utexas.edu",
          phone: "369-790-5073",
          address: "06577 Southridge Drive",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Wikizz",
          contact: "Garrik Salzen",
          email: "gsalzen25@photobucket.com",
          phone: "120-881-7209",
          address: "8 Brentwood Crossing",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Plambee",
          contact: "Friederike Bew",
          email: "fbew26@go.com",
          phone: "445-723-2557",
          address: "2 Prentice Hill",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Skinder",
          contact: "Harmonia Barks",
          email: "hbarks27@printfriendly.com",
          phone: "171-185-2766",
          address: "3382 Dottie Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Abata",
          contact: "Windy Gratrix",
          email: "wgratrix28@jiathis.com",
          phone: "904-659-1179",
          address: "2575 Division Drive",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Flipbug",
          contact: "Isador Connerry",
          email: "iconnerry29@parallels.com",
          phone: "542-640-3398",
          address: "90282 Lillian Avenue",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Layo",
          contact: "Marleen Landsberg",
          email: "mlandsberg2a@google.co.jp",
          phone: "628-413-7681",
          address: "3 Dunning Drive",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Aibox",
          contact: "Lana Knock",
          email: "lknock2b@blinklist.com",
          phone: "946-984-3844",
          address: "42010 Eastlawn Trail",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kimia",
          contact: "Phillipe Klewi",
          email: "pklewi2c@weebly.com",
          phone: "404-466-1201",
          address: "471 Sherman Court",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Kwimbee",
          contact: "Thomasin Kinkaid",
          email: "tkinkaid2d@epa.gov",
          phone: "513-777-4063",
          address: "7 Reindahl Court",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Quinu",
          contact: "Nicolette Wrathmell",
          email: "nwrathmell2e@flickr.com",
          phone: "167-863-1392",
          address: "37 Vahlen Trail",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Ooba",
          contact: "Tamarah Stelfax",
          email: "tstelfax2f@tinyurl.com",
          phone: "574-739-8312",
          address: "86814 Mayer Road",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Skiptube",
          contact: "Kinny Clarkson",
          email: "kclarkson2g@nydailynews.com",
          phone: "939-231-3107",
          address: "65194 Mcguire Drive",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Yabox",
          contact: "Cornie Goodsal",
          email: "cgoodsal2h@yolasite.com",
          phone: "731-631-2135",
          address: "900 Lukken Terrace",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Einti",
          contact: "Ange Quillinane",
          email: "aquillinane2i@gmpg.org",
          phone: "984-187-9747",
          address: "803 Bluejay Lane",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Bubbletube",
          contact: "Fannie Tremmel",
          email: "ftremmel2j@imageshack.us",
          phone: "541-483-4758",
          address: "13399 Sutteridge Lane",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Flipstorm",
          contact: "Jud Johncey",
          email: "jjohncey2k@facebook.com",
          phone: "830-459-5696",
          address: "23 Brown Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Browsebug",
          contact: "Erskine Boothman",
          email: "eboothman2l@chron.com",
          phone: "783-175-1133",
          address: "2 4th Center",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Quaxo",
          contact: "Valentijn Gheeraert",
          email: "vgheeraert2m@icq.com",
          phone: "359-608-7545",
          address: "51684 Scott Parkway",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Realmix",
          contact: "Jasen Daborn",
          email: "jdaborn2n@moonfruit.com",
          phone: "736-410-3591",
          address: "4589 Golf View Parkway",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Oozz",
          contact: "Dulci Connaughton",
          email: "dconnaughton2o@wordpress.com",
          phone: "484-998-1984",
          address: "6026 Carberry Trail",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Photofeed",
          contact: "Georg Vinten",
          email: "gvinten2p@tamu.edu",
          phone: "260-968-9805",
          address: "25612 Forest Place",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Meembee",
          contact: "Raphaela Eadon",
          email: "readon2q@mtv.com",
          phone: "789-549-0423",
          address: "0780 Transport Way",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Trunyx",
          contact: "Renell Huriche",
          email: "rhuriche2r@oracle.com",
          phone: "768-588-4335",
          address: "1 Hansons Junction",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
