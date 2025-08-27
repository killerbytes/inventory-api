--
-- PostgreSQL database dump
--

\restrict J127rv2Crj30xMc4UnqcMCSLhJwp0cVUy2QrZhy2NGqk9iettD8O18BZW52AsNv

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Categories" (id, name, description, "order", "deletedAt") FROM stdin;
1	Building Materials	Foundation materials including lumber, plywood, concrete, roofing, siding, insulation, drywall, and fencing	1	\N
2	Hardware	Essential small parts like fasteners (nails, screws), tools accessories, door/window/cabinet hardware, chains, and electrical boxes	2	\N
3	Paint & Supplies	Interior/exterior paint, stains, spray paint, brushes, rollers, tape, wallpaper, and painting preparation materials	3	\N
4	Tools	Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)	4	\N
5	Plumbing	Water systems components including pipes, fittings, water heaters, faucets, sinks, sump pumps, and toilets	\N	\N
6	Electrical	Power and lighting systems with wiring, breakers, switches, outlets, lighting fixtures, ceiling fans, and generators	\N	\N
7	Flooring	Surface coverings like carpet, hardwood, laminate, vinyl, tile, underlayment, and area rugs	\N	\N
8	Kitchen & Bath	Renovation essentials including cabinets, countertops, sinks, faucets, vanities, bathtubs, showers, and toilets	\N	\N
9	Doors & Windows	Interior/exterior doors, various window types, and garage doors for entryways and natural light	\N	\N
10	Garden Center	Plants (trees/shrubs/flowers), soil, mulch, fertilizer, gardening tools, and pest control for landscaping	\N	\N
\.


--
-- Data for Name: Products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Products" (id, name, description, unit, "categoryId", sku, "conversionFactor", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Shovel	\N	PCS	4	04|SHO	\N	2025-08-21 11:07:55.859+08	2025-08-21 11:07:55.859+08	\N
2	Shovel Steel Frame & Handle	\N	PCS	4	04|SHO_STE_FR	\N	2025-08-21 11:14:41.981+08	2025-08-21 11:14:41.981+08	\N
3	Ecolum LED Bulb DL E27	\N	PCS	6	06|ECO_LED_BU	\N	2025-08-21 11:21:38.313+08	2025-08-21 11:21:38.313+08	\N
4	America Panel Box	\N	PCS	6	06|AME_PAN_BO	\N	2025-08-21 12:43:38.266+08	2025-08-21 12:43:38.266+08	\N
\.


--
-- Data for Name: ProductCombinations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductCombinations" (id, "productId", name, sku, price, "reorderLevel", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	1	Shovel - Spade	04|SHO|PCS|SPA	115.00	10	2025-08-21 11:08:31.469+08	2025-08-21 11:08:31.469+08	\N
2	1	Shovel - Square	04|SHO|PCS|SQU	115.00	10	2025-08-21 11:08:31.482+08	2025-08-21 11:08:31.482+08	\N
3	2	Shovel Steel Frame & Handle - Spade	04|SHO_STE_FR|PCS|SPA	170.00	10	2025-08-21 11:15:12.382+08	2025-08-21 11:15:12.382+08	\N
4	2	Shovel Steel Frame & Handle - Square	04|SHO_STE_FR|PCS|SQU	170.00	10	2025-08-21 11:15:12.391+08	2025-08-21 11:15:12.391+08	\N
5	3	Ecolum LED Bulb DL E27 - 3w	06|ECO_LED_BU|PCS|3W	37.50	10	2025-08-21 11:23:08.003+08	2025-08-21 14:26:36.969+08	\N
6	3	Ecolum LED Bulb DL E27 - 5w	06|ECO_LED_BU|PCS|5W	43.00	10	2025-08-21 11:23:08.015+08	2025-08-21 14:26:36.972+08	\N
7	4	America Panel Box - 2B | 2x2	06|AME_PAN_BO|PCS|2B|2X2	400.00	10	2025-08-21 12:44:58.338+08	2025-08-21 14:28:47.901+08	\N
8	4	America Panel Box - 4B | 3x3	06|AME_PAN_BO|PCS|4B|3X3	500.00	10	2025-08-21 12:44:58.345+08	2025-08-21 14:28:47.903+08	\N
9	4	America Panel Box - 6B | 4x4	06|AME_PAN_BO|PCS|6B|4X4	600.00	10	2025-08-21 12:44:58.348+08	2025-08-21 14:28:47.904+08	\N
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Users" (id, name, username, email, password, "isActive", "isAdmin", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Joel Carlos	killerbytes	joelcarlos02@gmail.com	$2b$08$c.Xkrs4/RZkHTADSYw800u1eMzdbFg5sHg/1N3O6loky6il6l6zuG	t	f	2025-08-21 11:06:37.102+08	2025-08-21 11:06:37.102+08	\N
2	Admin	admin	admin@admin.com	$2b$08$1mlozAcAkq/DhTG8//KesOgo674WO.SthucbTKIP43A.XH9uTtR8e	t	f	2025-08-21 15:01:00.53+08	2025-08-21 15:01:24.412+08	\N
3	Test	test	test@test.com	$2b$08$TB0/asUl.otIy8i4cC/w3eWvy4gSlN.onWi4mHK0YmvTc.00N1EC6	f	f	2025-08-21 15:17:20.028+08	2025-08-21 15:17:20.028+08	\N
\.


--
-- Data for Name: BreakPacks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BreakPacks" (id, "fromCombinationId", "toCombinationId", quantity, "conversionFactor", "createdBy", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: VariantTypes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VariantTypes" (id, name, "productId", "isTemplate", "createdAt", "updatedAt") FROM stdin;
1	Type	1	\N	2025-08-21 11:08:10.679+08	2025-08-21 11:08:10.679+08
2	Type	2	\N	2025-08-21 11:14:56.93+08	2025-08-21 11:14:56.93+08
3	Wattage	3	\N	2025-08-21 11:22:20.941+08	2025-08-21 11:22:20.941+08
4	Type 1	4	\N	2025-08-21 12:44:03.941+08	2025-08-21 12:44:03.941+08
5	Type 2	4	\N	2025-08-21 12:44:21.523+08	2025-08-21 12:44:21.523+08
\.


--
-- Data for Name: VariantValues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VariantValues" (id, value, "variantTypeId", "createdAt", "updatedAt") FROM stdin;
1	Spade	1	2025-08-21 11:08:10.681+08	2025-08-21 11:08:10.681+08
2	Square	1	2025-08-21 11:08:10.683+08	2025-08-21 11:08:10.683+08
3	Spade	2	2025-08-21 11:14:56.934+08	2025-08-21 11:14:56.934+08
4	Square	2	2025-08-21 11:14:56.937+08	2025-08-21 11:14:56.937+08
5	3w	3	2025-08-21 11:22:20.945+08	2025-08-21 11:22:20.945+08
6	5w	3	2025-08-21 11:22:20.947+08	2025-08-21 11:22:20.947+08
7	7w	3	2025-08-21 11:22:20.948+08	2025-08-21 11:22:20.948+08
8	9w	3	2025-08-21 11:22:20.95+08	2025-08-21 11:22:20.95+08
9	11	3	2025-08-21 11:22:20.95+08	2025-08-21 11:22:20.95+08
10	13w	3	2025-08-21 11:22:20.951+08	2025-08-21 11:22:20.951+08
11	15w	3	2025-08-21 11:22:20.952+08	2025-08-21 11:22:20.952+08
12	17w	3	2025-08-21 11:22:20.953+08	2025-08-21 11:22:20.953+08
13	19w	3	2025-08-21 11:22:20.953+08	2025-08-21 11:22:20.953+08
14	2B	4	2025-08-21 12:44:03.943+08	2025-08-21 12:44:03.943+08
15	4B	4	2025-08-21 12:44:03.944+08	2025-08-21 12:44:03.944+08
16	6B	4	2025-08-21 12:44:03.945+08	2025-08-21 12:44:03.945+08
17	2x2	5	2025-08-21 12:44:21.526+08	2025-08-21 12:44:21.526+08
18	3x3	5	2025-08-21 12:44:21.527+08	2025-08-21 12:44:21.527+08
19	4x4	5	2025-08-21 12:44:21.528+08	2025-08-21 12:44:21.528+08
\.


--
-- Data for Name: CombinationValues; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CombinationValues" ("combinationId", "variantValueId", "createdAt", "updatedAt") FROM stdin;
1	1	2025-08-21 11:08:31.473+08	2025-08-21 11:08:31.473+08
2	2	2025-08-21 11:08:31.484+08	2025-08-21 11:08:31.484+08
3	3	2025-08-21 11:15:12.384+08	2025-08-21 11:15:12.384+08
4	4	2025-08-21 11:15:12.392+08	2025-08-21 11:15:12.392+08
5	5	2025-08-21 11:23:08.007+08	2025-08-21 11:23:08.007+08
6	6	2025-08-21 11:23:08.016+08	2025-08-21 11:23:08.016+08
7	14	2025-08-21 12:44:58.339+08	2025-08-21 12:44:58.339+08
7	17	2025-08-21 12:44:58.339+08	2025-08-21 12:44:58.339+08
8	15	2025-08-21 12:44:58.346+08	2025-08-21 12:44:58.346+08
8	18	2025-08-21 12:44:58.346+08	2025-08-21 12:44:58.346+08
9	16	2025-08-21 12:44:58.349+08	2025-08-21 12:44:58.349+08
9	19	2025-08-21 12:44:58.349+08	2025-08-21 12:44:58.349+08
\.


--
-- Data for Name: Customers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Customers" (id, name, email, phone, address, notes, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	User	\N	\N	Unknown	\N	t	2025-08-21 11:06:37.084+08	2025-08-21 11:06:37.084+08	\N
\.


--
-- Data for Name: Inventories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Inventories" (id, "combinationId", quantity, "createdAt", "updatedAt", "deletedAt") FROM stdin;
2	2	0	2025-08-21 11:08:31.486+08	2025-08-21 11:08:31.486+08	\N
4	4	0	2025-08-21 11:15:12.394+08	2025-08-21 11:15:12.394+08	\N
5	5	0	2025-08-21 11:23:08.009+08	2025-08-21 11:23:08.009+08	\N
8	8	0	2025-08-21 12:44:58.347+08	2025-08-21 12:44:58.347+08	\N
9	9	0	2025-08-21 12:44:58.35+08	2025-08-21 12:44:58.35+08	\N
1	1	17	2025-08-21 11:08:31.475+08	2025-08-21 16:55:52.513+08	\N
3	3	7	2025-08-21 11:15:12.386+08	2025-08-21 16:55:52.514+08	\N
6	6	1	2025-08-21 11:23:08.018+08	2025-08-21 16:58:16.957+08	\N
7	7	10	2025-08-21 12:44:58.341+08	2025-08-21 16:59:01.465+08	\N
\.


--
-- Data for Name: InventoryBreakPacks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryBreakPacks" (id, "fromCombinationId", "toCombinationId", "fromQuantity", "toQuantity", reason, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: StockAdjustments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StockAdjustments" (id, "referenceNo", "combinationId", "systemQuantity", "newQuantity", difference, reason, notes, "createdBy", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	REF0.18691431250854174	7	0	10	10	SUPPLIER_BONUS	\N	1	2025-08-21 16:59:01.46+08	2025-08-21 16:59:01.46+08	\N
\.


--
-- Data for Name: InventoryMovements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."InventoryMovements" (id, type, previous, new, quantity, reference, reason, "createdAt", "updatedAt", "userId", "combinationId", "referenceId") FROM stdin;
1	IN	0	10	10	1	\N	2025-08-21 16:23:00.349+08	2025-08-21 16:23:00.349+08	1	3	\N
2	IN	0	20	20	1	\N	2025-08-21 16:23:00.349+08	2025-08-21 16:23:00.349+08	1	1	\N
3	OUT	20	19	1	1	\N	2025-08-21 16:37:51.464+08	2025-08-21 16:37:51.464+08	1	1	\N
4	OUT	10	9	1	1	\N	2025-08-21 16:37:51.465+08	2025-08-21 16:37:51.465+08	1	3	\N
5	OUT	19	18	1	2	\N	2025-08-21 16:50:40.213+08	2025-08-21 16:50:40.213+08	1	1	\N
6	OUT	9	8	1	2	\N	2025-08-21 16:50:40.214+08	2025-08-21 16:50:40.214+08	1	3	\N
7	OUT	18	17	1	3	\N	2025-08-21 16:55:52.51+08	2025-08-21 16:55:52.51+08	1	1	\N
8	OUT	8	7	1	3	\N	2025-08-21 16:55:52.511+08	2025-08-21 16:55:52.511+08	1	3	\N
9	IN	0	1	1	2	\N	2025-08-21 16:58:16.955+08	2025-08-21 16:58:16.955+08	1	6	\N
10	STOCK_ADJUSTMENT	0	10	10	7	SUPPLIER_BONUS	2025-08-21 16:59:01.462+08	2025-08-21 16:59:01.462+08	1	7	\N
\.


--
-- Data for Name: Suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Suppliers" (id, name, contact, email, phone, address, notes, "isActive", "createdAt", "updatedAt", "deletedAt") FROM stdin;
1	Eayo	Tomasina Wanden	twanden0@npr.org	839-265-9013	93872 Graceland Alley	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
2	Skiptube	Ansley Perfili	aperfili1@phoca.cz	794-145-3624	830 Harper Street	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
3	Buzzbean	Melesa Clyde	mclyde2@ox.ac.uk	189-755-3180	9 Glendale Plaza	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
4	Twinte	Nita Beardall	nbeardall3@redcross.org	888-338-9394	61 Stuart Crossing	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
5	Riffpath	Stacia Benko	sbenko4@uiuc.edu	483-879-5016	0982 Bay Road	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
6	Twitterwire	Sheeree Poulston	spoulston5@accuweather.com	535-912-8960	08 Iowa Plaza	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
7	Roombo	Leland Borrows	lborrows6@google.co.jp	837-604-9075	89625 Melody Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
8	Gabtype	Cornelius Conniam	cconniam7@mac.com	676-350-3045	06762 Fisk Place	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
9	Yacero	Sam Dallinder	sdallinder8@over-blog.com	602-534-5164	5181 Warner Crossing	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
10	Viva	Karin Bassick	kbassick9@mayoclinic.com	840-109-5123	6 Westport Lane	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
11	Wordpedia	Nyssa Woodvine	nwoodvinea@stumbleupon.com	751-948-0201	7740 Amoth Terrace	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
12	Kimia	Daune Winnard	dwinnardb@freewebs.com	960-824-3857	5940 Pleasure Trail	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
13	Zoombeat	Alejandrina Dumbell	adumbellc@blog.com	402-202-5555	14007 Lukken Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
14	Fivebridge	Annissa Burborough	aburboroughd@howstuffworks.com	611-501-8783	054 Susan Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
15	Buzzbean	Rhianna Filippone	rfilipponee@mayoclinic.com	910-831-8353	41 Dakota Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
16	Edgeify	Hernando Huncoot	hhuncootf@goo.ne.jp	559-597-9052	6156 Hoepker Road	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
17	Gabtype	Barby Witherspoon	bwitherspoong@barnesandnoble.com	908-872-6376	44859 Pennsylvania Parkway	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
18	Aimbo	Conan Tzarkov	ctzarkovh@ftc.gov	675-455-2222	8 Annamark Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
19	Photobug	Elora Simonassi	esimonassii@salon.com	329-696-2294	2038 Monterey Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
20	Twimbo	Addia Carnall	acarnallj@sogou.com	302-508-3446	2679 Di Loreto Alley	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
21	Tambee	Nanine Pallent	npallentk@ox.ac.uk	673-764-6971	98 Canary Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
22	Kamba	Paco Abdee	pabdeel@blogger.com	603-717-6862	84 Southridge Pass	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
23	Tagcat	Taffy Addekin	taddekinm@bbb.org	254-848-5434	09868 Gerald Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
24	Centizu	Levon Keller	lkellern@w3.org	642-210-7759	1717 Vidon Plaza	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
25	Bubblemix	Gweneth Staniforth	gstanifortho@archive.org	857-465-5011	198 Novick Trail	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
26	Rooxo	Cyb McCraw	cmccrawp@behance.net	864-137-9649	68431 Dixon Alley	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
27	Jetpulse	Amandy Musgrove	amusgroveq@webs.com	903-962-2962	8 Upham Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
28	Edgeify	Orv Poli	opolir@illinois.edu	797-878-8025	47592 Scott Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
29	Mynte	Norean Duly	ndulys@hibu.com	312-986-5488	784 Blaine Lane	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
30	Topiclounge	Valma Chatten	vchattent@slashdot.org	558-343-9322	40740 Grayhawk Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
31	Topiczoom	Chaim Dunniom	cdunniomu@mediafire.com	981-505-9626	02272 Raven Street	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
32	Yacero	Grange Tinton	gtintonv@quantcast.com	163-752-0363	84293 Warbler Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
33	Ailane	Franny Godfery	fgodferyw@e-recht24.de	398-548-7737	712 Shoshone Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
34	Kayveo	Alane Robertacci	arobertaccix@nps.gov	502-324-2248	718 Elmside Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
35	Realcube	Barnaby Menel	bmenely@rakuten.co.jp	470-406-2420	3724 Arrowood Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
36	Rooxo	Enrichetta Dyers	edyersz@usgs.gov	129-149-7310	740 Nobel Junction	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
37	Einti	Alanna Maycock	amaycock10@answers.com	529-212-6664	04451 Park Meadow Park	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
38	Edgepulse	Giulietta Doulton	gdoulton11@twitpic.com	429-880-9325	84 Oak Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
39	Voolith	Dolph Gruby	dgruby12@miitbeian.gov.cn	303-138-9917	0 Corben Street	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
40	Thoughtworks	Lucie Freestone	lfreestone13@si.edu	431-767-1703	76628 Talmadge Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
41	Divape	Ransell Bricham	rbricham14@paginegialle.it	805-297-5156	7 South Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
42	Dablist	Rita Symson	rsymson15@mapquest.com	619-607-5503	9 Continental Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
43	Flipstorm	Joellen Kyle	jkyle16@de.vu	593-477-4720	7 Longview Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
44	Tazz	Caddric Nobes	cnobes17@icio.us	999-252-6725	4277 Randy Trail	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
45	Gabcube	Creight Guidera	cguidera18@google.com	791-849-4174	68 Rusk Road	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
46	Blognation	Retha Ketton	rketton19@i2i.jp	772-345-3239	02979 Victoria Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
47	Buzzdog	Naomi Incogna	nincogna1a@360.cn	874-477-4357	0 Fuller Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
48	Skippad	Broderick Flannigan	bflannigan1b@macromedia.com	907-213-3067	582 Loomis Terrace	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
49	Trilia	Roberta Mallall	rmallall1c@nhs.uk	699-639-3816	86548 Brown Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
50	Yoveo	Jada Malham	jmalham1d@google.pl	765-918-2498	8 Bartelt Junction	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
51	Twitterbridge	Fidela Gascone	fgascone1e@yale.edu	434-919-7166	6 Prairie Rose Street	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
52	Zooveo	Babbie Impy	bimpy1f@furl.net	536-332-7950	578 Laurel Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
53	Linklinks	Aidan McCreadie	amccreadie1g@va.gov	216-636-2362	47 Sundown Lane	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
54	Oyoyo	Melessa Tague	mtague1h@archive.org	879-762-3671	95 Montana Junction	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
55	Fiveclub	Garrot Louth	glouth1i@army.mil	822-931-4540	3 Mariners Cove Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
56	JumpXS	Lotte Vinnick	lvinnick1j@kickstarter.com	854-249-6169	39682 Porter Point	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
57	Jatri	Cherye Dowry	cdowry1k@dion.ne.jp	219-541-2756	28029 Northport Parkway	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
58	Yodo	Lib Emmett	lemmett1l@alibaba.com	749-819-5967	2 Northridge Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
59	Oozz	Salomo Ruskin	sruskin1m@google.pl	415-258-1870	325 Dryden Circle	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
60	Photolist	Randie Goodered	rgoodered1n@cnn.com	542-778-6416	3179 Mallory Plaza	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
61	Shuffledrive	Natty Lerohan	nlerohan1o@irs.gov	952-275-4160	490 Mitchell Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
62	Cogidoo	Matt Vause	mvause1p@abc.net.au	626-724-3325	16468 Heffernan Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
63	Flipopia	Ivor Destouche	idestouche1q@spotify.com	332-676-1985	432 Gateway Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
64	Zoomdog	Rees Ganiford	rganiford1r@discovery.com	626-805-4472	5910 Jana Place	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
65	Avamba	Nels Amor	namor1s@webnode.com	583-382-6420	97278 Northwestern Court	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
66	Plajo	Giustino Shay	gshay1t@miibeian.gov.cn	433-634-4103	51 Northland Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
67	Muxo	Ruperta Caldecourt	rcaldecourt1u@mozilla.org	480-311-2036	76 Melody Court	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
68	Ooba	Mari Pietron	mpietron1v@rakuten.co.jp	525-786-5218	706 Reindahl Circle	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
69	Yambee	Carmelita Stonestreet	cstonestreet1w@virginia.edu	860-974-8897	2812 Orin Street	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
70	Jayo	Johnnie Headingham	jheadingham1x@google.cn	462-393-6963	4177 Gerald Park	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
71	Kwilith	Petra Millett	pmillett1y@technorati.com	832-320-8861	914 Hagan Pass	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
72	Realmix	Caroline Culpen	cculpen1z@addthis.com	504-212-6399	11 Aberg Alley	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
73	Babbleblab	Joe MacHostie	jmachostie20@independent.co.uk	508-726-1645	09 Arizona Circle	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
74	Skyndu	Randee Noton	rnoton21@economist.com	625-171-7557	0358 Independence Terrace	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
75	Buzzshare	Celeste Steuart	csteuart22@theatlantic.com	533-613-5437	76381 Cardinal Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
76	Demimbu	Natassia Crotty	ncrotty23@home.pl	419-476-9313	353 Ohio Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
77	Kimia	Dugald Bleby	dbleby24@utexas.edu	369-790-5073	06577 Southridge Drive	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
78	Wikizz	Garrik Salzen	gsalzen25@photobucket.com	120-881-7209	8 Brentwood Crossing	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
79	Plambee	Friederike Bew	fbew26@go.com	445-723-2557	2 Prentice Hill	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
80	Skinder	Harmonia Barks	hbarks27@printfriendly.com	171-185-2766	3382 Dottie Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
81	Abata	Windy Gratrix	wgratrix28@jiathis.com	904-659-1179	2575 Division Drive	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
82	Flipbug	Isador Connerry	iconnerry29@parallels.com	542-640-3398	90282 Lillian Avenue	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
83	Layo	Marleen Landsberg	mlandsberg2a@google.co.jp	628-413-7681	3 Dunning Drive	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
84	Aibox	Lana Knock	lknock2b@blinklist.com	946-984-3844	42010 Eastlawn Trail	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
85	Kimia	Phillipe Klewi	pklewi2c@weebly.com	404-466-1201	471 Sherman Court	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
86	Kwimbee	Thomasin Kinkaid	tkinkaid2d@epa.gov	513-777-4063	7 Reindahl Court	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
87	Quinu	Nicolette Wrathmell	nwrathmell2e@flickr.com	167-863-1392	37 Vahlen Trail	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
88	Ooba	Tamarah Stelfax	tstelfax2f@tinyurl.com	574-739-8312	86814 Mayer Road	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
89	Skiptube	Kinny Clarkson	kclarkson2g@nydailynews.com	939-231-3107	65194 Mcguire Drive	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
90	Yabox	Cornie Goodsal	cgoodsal2h@yolasite.com	731-631-2135	900 Lukken Terrace	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
91	Einti	Ange Quillinane	aquillinane2i@gmpg.org	984-187-9747	803 Bluejay Lane	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
92	Bubbletube	Fannie Tremmel	ftremmel2j@imageshack.us	541-483-4758	13399 Sutteridge Lane	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
93	Flipstorm	Jud Johncey	jjohncey2k@facebook.com	830-459-5696	23 Brown Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
94	Browsebug	Erskine Boothman	eboothman2l@chron.com	783-175-1133	2 4th Center	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
95	Quaxo	Valentijn Gheeraert	vgheeraert2m@icq.com	359-608-7545	51684 Scott Parkway	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
96	Realmix	Jasen Daborn	jdaborn2n@moonfruit.com	736-410-3591	4589 Golf View Parkway	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
97	Oozz	Dulci Connaughton	dconnaughton2o@wordpress.com	484-998-1984	6026 Carberry Trail	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
98	Photofeed	Georg Vinten	gvinten2p@tamu.edu	260-968-9805	25612 Forest Place	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
99	Meembee	Raphaela Eadon	readon2q@mtv.com	789-549-0423	0780 Transport Way	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
100	Trunyx	Renell Huriche	rhuriche2r@oracle.com	768-588-4335	1 Hansons Junction	\N	t	2025-08-21 11:06:37.106+08	2025-08-21 11:06:37.106+08	\N
\.


--
-- Data for Name: PurchaseOrders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PurchaseOrders" (id, "purchaseOrderNumber", "supplierId", status, "deliveryDate", "cancellationReason", "totalAmount", notes, "internalNotes", "modeOfPayment", "checkNumber", "dueDate", "createdAt", "updatedAt") FROM stdin;
1	9041979	97	RECEIVED	2025-08-21 08:48:15.066+08	\N	4000.00	\N	\N	CHECK	12312344	2025-08-28 08:48:15.066+08	2025-08-21 16:22:48.093+08	2025-08-21 16:23:00.321+08
2	1940340	97	RECEIVED	2025-08-21 16:21:57.081+08	\N	100.00	\N	\N	CASH	\N	2025-08-28 16:21:57.081+08	2025-08-21 16:58:11.378+08	2025-08-21 16:58:16.943+08
\.


--
-- Data for Name: SalesOrders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SalesOrders" (id, "salesOrderNumber", "customerId", status, "orderDate", "isDelivery", "isDeliveryCompleted", "deliveryAddress", "deliveryInstructions", "deliveryDate", "cancellationReason", "totalAmount", notes, "internalNotes", "modeOfPayment", "checkNumber", "dueDate", "createdAt", "updatedAt") FROM stdin;
1	2297703	1	RECEIVED	2025-08-21 16:32:46.381+08	f	\N	\N	\N	\N	\N	285.00	\N	\N	CASH	\N	\N	2025-08-21 16:33:11.227+08	2025-08-21 16:37:51.446+08
2	2544074	1	RECEIVED	2025-08-21 16:50:09.462+08	f	\N	\N	\N	\N	\N	285.00	\N	\N	CASH	\N	\N	2025-08-21 16:50:21.079+08	2025-08-21 16:50:40.196+08
3	5279904	1	RECEIVED	2025-08-21 16:55:15.432+08	f	\N	\N	\N	\N	\N	285.00	\N	\N	CASH	\N	\N	2025-08-21 16:55:23.794+08	2025-08-21 16:55:52.491+08
4	1083068	1	PENDING	2025-08-21 16:56:05.196+08	f	\N	\N	\N	\N	\N	285.00	\N	\N	CASH	\N	\N	2025-08-21 16:56:12.745+08	2025-08-21 16:56:12.745+08
\.


--
-- Data for Name: OrderStatusHistories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."OrderStatusHistories" (id, "purchaseOrderId", "salesOrderId", status, "changedBy", "changedAt", "createdAt", "updatedAt") FROM stdin;
1	1	\N	PENDING	1	2025-08-21 16:22:48.104+08	2025-08-21 16:22:48.104+08	2025-08-21 16:22:48.104+08
2	1	\N	RECEIVED	1	2025-08-21 16:23:00.356+08	2025-08-21 16:23:00.356+08	2025-08-21 16:23:00.356+08
3	\N	1	PENDING	1	2025-08-21 16:33:11.233+08	2025-08-21 16:33:11.233+08	2025-08-21 16:33:11.233+08
4	\N	1	RECEIVED	1	2025-08-21 16:37:51.47+08	2025-08-21 16:37:51.47+08	2025-08-21 16:37:51.471+08
5	\N	2	PENDING	1	2025-08-21 16:50:21.086+08	2025-08-21 16:50:21.086+08	2025-08-21 16:50:21.086+08
6	\N	2	RECEIVED	1	2025-08-21 16:50:40.219+08	2025-08-21 16:50:40.219+08	2025-08-21 16:50:40.219+08
7	\N	3	PENDING	1	2025-08-21 16:55:23.802+08	2025-08-21 16:55:23.802+08	2025-08-21 16:55:23.802+08
8	\N	3	RECEIVED	1	2025-08-21 16:55:52.515+08	2025-08-21 16:55:52.515+08	2025-08-21 16:55:52.515+08
9	\N	4	PENDING	1	2025-08-21 16:56:12.752+08	2025-08-21 16:56:12.752+08	2025-08-21 16:56:12.752+08
10	2	\N	PENDING	1	2025-08-21 16:58:11.382+08	2025-08-21 16:58:11.382+08	2025-08-21 16:58:11.382+08
11	2	\N	RECEIVED	1	2025-08-21 16:58:16.957+08	2025-08-21 16:58:16.957+08	2025-08-21 16:58:16.957+08
\.


--
-- Data for Name: PurchaseOrderItems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PurchaseOrderItems" (id, "purchaseOrderId", "combinationId", quantity, "purchasePrice", "totalAmount", discount, "discountNote", unit, "skuSnapshot", "nameSnapshot", "categorySnapshot", "variantSnapshot", "createdAt", "updatedAt") FROM stdin;
1	1	3	10	170.00	1700.00	50.00	\N	PCS	04|SHO_STE_FR|PCS|SPA	Shovel Steel Frame & Handle	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:23:00.337+08	2025-08-21 16:23:00.337+08
2	1	1	20	115.00	2300.00	30.00	\N	PCS	04|SHO|PCS|SPA	Shovel	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:23:00.337+08	2025-08-21 16:23:00.337+08
3	2	6	1	100.00	100.00	\N	\N	PCS	06|ECO_LED_BU|PCS|5W	Ecolum LED Bulb DL E27	{"id":6,"name":"Electrical","description":"Power and lighting systems with wiring, breakers, switches, outlets, lighting fixtures, ceiling fans, and generators","order":null}	{"Wattage":"5w"}	2025-08-21 16:58:16.952+08	2025-08-21 16:58:16.952+08
\.


--
-- Data for Name: SalesOrderItems; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SalesOrderItems" (id, "salesOrderId", "combinationId", quantity, "originalPrice", "purchasePrice", "totalAmount", discount, unit, "discountNote", "skuSnapshot", "nameSnapshot", "categorySnapshot", "variantSnapshot", "createdAt", "updatedAt", "inventoryId") FROM stdin;
1	1	1	1	115.00	115.00	115.00	\N	PCS	\N	04|SHO|PCS|SPA	Shovel	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:37:51.457+08	2025-08-21 16:37:51.457+08	\N
2	1	3	1	170.00	170.00	170.00	0.00	PCS		04|SHO_STE_FR|PCS|SPA	Shovel Steel Frame & Handle	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:37:51.457+08	2025-08-21 16:37:51.457+08	\N
3	2	1	1	115.00	115.00	115.00	\N	PCS	\N	04|SHO|PCS|SPA	Shovel	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:50:40.205+08	2025-08-21 16:50:40.205+08	\N
4	2	3	1	170.00	170.00	170.00	0.00	PCS		04|SHO_STE_FR|PCS|SPA	Shovel Steel Frame & Handle	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:50:40.205+08	2025-08-21 16:50:40.205+08	\N
5	3	1	1	115.00	115.00	115.00	\N	PCS	\N	04|SHO|PCS|SPA	Shovel	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:55:52.502+08	2025-08-21 16:55:52.502+08	\N
6	3	3	1	170.00	170.00	170.00	0.00	PCS		04|SHO_STE_FR|PCS|SPA	Shovel Steel Frame & Handle	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:55:52.502+08	2025-08-21 16:55:52.502+08	\N
7	4	3	1	170.00	170.00	170.00	\N	PCS	\N	04|SHO_STE_FR|PCS|SPA	Shovel Steel Frame & Handle	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:56:12.749+08	2025-08-21 16:56:12.749+08	\N
8	4	1	1	115.00	115.00	115.00	0.00	PCS		04|SHO|PCS|SPA	Shovel	{"id":4,"name":"Tools","description":"Power tools (drills, saws), hand tools (hammers, wrenches), tool storage, and outdoor power equipment (mowers, trimmers)","order":4}	{"Type":"Spade"}	2025-08-21 16:56:12.749+08	2025-08-21 16:56:12.749+08	\N
\.


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SequelizeMeta" (name) FROM stdin;
20250818045347_init.js
\.


--
-- Name: BreakPacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."BreakPacks_id_seq"', 1, false);


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Categories_id_seq"', 1, false);


--
-- Name: Customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Customers_id_seq"', 1, true);


--
-- Name: Inventories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Inventories_id_seq"', 9, true);


--
-- Name: InventoryBreakPacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."InventoryBreakPacks_id_seq"', 1, false);


--
-- Name: InventoryMovements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."InventoryMovements_id_seq"', 10, true);


--
-- Name: OrderStatusHistories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrderStatusHistories_id_seq"', 11, true);


--
-- Name: ProductCombinations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ProductCombinations_id_seq"', 9, true);


--
-- Name: Products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Products_id_seq"', 4, true);


--
-- Name: PurchaseOrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PurchaseOrderItems_id_seq"', 3, true);


--
-- Name: PurchaseOrders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PurchaseOrders_id_seq"', 2, true);


--
-- Name: SalesOrderItems_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SalesOrderItems_id_seq"', 8, true);


--
-- Name: SalesOrders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SalesOrders_id_seq"', 4, true);


--
-- Name: StockAdjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StockAdjustments_id_seq"', 1, true);


--
-- Name: Suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Suppliers_id_seq"', 100, true);


--
-- Name: Users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Users_id_seq"', 3, true);


--
-- Name: VariantTypes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."VariantTypes_id_seq"', 9, true);


--
-- Name: VariantValues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."VariantValues_id_seq"', 27, true);


--
-- PostgreSQL database dump complete
--

\unrestrict J127rv2Crj30xMc4UnqcMCSLhJwp0cVUy2QrZhy2NGqk9iettD8O18BZW52AsNv

