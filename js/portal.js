// js/portal.js – Versão final estável e segura (compatível com patrocinadores como string ou array)

const countries = [
    { code: '93', label: '🇦🇫 +93', name: '🇦🇫 Afghanistan (افغانستان)+93' },
    { code: '355', label: '🇦🇱 +355', name: '🇦🇱 Albania (Shqipëri)+355' },
    { code: '213', label: '🇩🇿 +213', name: '🇩🇿 Algeria (الجزائر)+213' },
    { code: '1', label: '🇦🇸 +1', name: '🇦🇸 American Samoa+1' },
    { code: '376', label: '🇦🇩 +376', name: '🇦🇩 Andorra+376' },
    { code: '244', label: '🇦🇴 +244', name: '🇦🇴 Angola+244' },
    { code: '1', label: '🇦🇮 +1', name: '🇦🇮 Anguilla+1' },
    { code: '1', label: '🇦🇬 +1', name: '🇦🇬 Antigua and Barbuda+1' },
    { code: '54', label: '🇦🇷 +54', name: '🇦🇷 Argentina+54' },
    { code: '374', label: '🇦🇲 +374', name: '🇦🇲 Armenia (Հայաստան)+374' },
    { code: '297', label: '🇦🇼 +297', name: '🇦🇼 Aruba+297' },
    { code: '61', label: '🇦🇺 +61', name: '🇦🇺 Australia+61' },
    { code: '43', label: '🇦🇹 +43', name: '🇦🇹 Austria (Österreich)+43' },
    { code: '994', label: '🇦🇿 +994', name: '🇦🇿 Azerbaijan (Azərbaycan)+994' },
    { code: '1', label: '🇧🇸 +1', name: '🇧🇸 Bahamas+1' },
    { code: '973', label: '🇧🇭 +973', name: '🇧🇭 Bahrain (البحرين)+973' },
    { code: '880', label: '🇧🇩 +880', name: '🇧🇩 Bangladesh (বাংলাদেশ)+880' },
    { code: '1', label: '🇧🇧 +1', name: '🇧🇧 Barbados+1' },
    { code: '375', label: '🇧🇾 +375', name: '🇧🇾 Belarus (Беларусь)+375' },
    { code: '32', label: '🇧🇪 +32', name: '🇧🇪 Belgium (België)+32' },
    { code: '501', label: '🇧🇿 +501', name: '🇧🇿 Belize+501' },
    { code: '229', label: '🇧🇯 +229', name: '🇧🇯 Benin (Bénin)+229' },
    { code: '1', label: '🇧🇲 +1', name: '🇧🇲 Bermuda+1' },
    { code: '975', label: '🇧🇹 +975', name: '🇧🇹 Bhutan (འབྲུག)+975' },
    { code: '591', label: '🇧🇴 +591', name: '🇧🇴 Bolivia+591' },
    { code: '387', label: '🇧🇦 +387', name: '🇧🇦 Bosnia and Herzegovina (Босна и Херцеговина)+387' },
    { code: '267', label: '🇧🇼 +267', name: '🇧🇼 Botswana+267' },
    { code: '55', label: '🇧🇷 +55', name: '🇧🇷 Brazil (Brasil)+55' },
    { code: '246', label: '🇮🇴 +246', name: '🇮🇴 British Indian Ocean Territory+246' },
    { code: '1', label: '🇻🇬 +1', name: '🇻🇬 British Virgin Islands+1' },
    { code: '673', label: '🇧🇳 +673', name: '🇧🇳 Brunei+673' },
    { code: '359', label: '🇧🇬 +359', name: '🇧🇬 Bulgaria (България)+359' },
    { code: '226', label: '🇧🇫 +226', name: '🇧🇫 Burkina Faso+226' },
    { code: '257', label: '🇧🇮 +257', name: '🇧🇮 Burundi (Uburundi)+257' },
    { code: '855', label: '🇰🇭 +855', name: '🇰🇭 Cambodia (កម្ពុជា)+855' },
    { code: '237', label: '🇨🇲 +237', name: '🇨🇲 Cameroon (Cameroun)+237' },
    { code: '1', label: '🇨🇦 +1', name: '🇨🇦 Canada+1' },
    { code: '238', label: '🇨🇻 +238', name: '🇨🇻 Cape Verde (Kabu Verdi)+238' },
    { code: '599', label: '🇧🇶 +599', name: '🇧🇶 Caribbean Netherlands+599' },
    { code: '1', label: '🇰🇾 +1', name: '🇰🇾 Cayman Islands+1' },
    { code: '236', label: '🇨🇫 +236', name: '🇨🇫 Central African Republic (République centrafricaine)+236' },
    { code: '235', label: '🇹🇩 +235', name: '🇹🇩 Chad (Tchad)+235' },
    { code: '56', label: '🇨🇱 +56', name: '🇨🇱 Chile+56' },
    { code: '86', label: '🇨🇳 +86', name: '🇨🇳 China (中国)+86' },
    { code: '61', label: '🇨🇽 +61', name: '🇨🇽 Christmas Island+61' },
    { code: '61', label: '🇨🇨 +61', name: '🇨🇨 Cocos (Keeling) Islands+61' },
    { code: '57', label: '🇨🇴 +57', name: '🇨🇴 Colombia+57' },
    { code: '269', label: '🇰🇲 +269', name: '🇰🇲 Comoros (جزر القمر)+269' },
    { code: '243', label: '🇨🇩 +243', name: '🇨🇩 Congo (DRC) (Jamhuri ya Kidemokrasia ya Kongo)+243' },
    { code: '242', label: '🇨🇬 +242', name: '🇨🇬 Congo (Republic) (Congo-Brazzaville)+242' },
    { code: '682', label: '🇨🇰 +682', name: '🇨🇰 Cook Islands+682' },
    { code: '506', label: '🇨🇷 +506', name: '🇨🇷 Costa Rica+506' },
    { code: '225', label: '🇨🇮 +225', name: '🇨🇮 Côte d\'Ivoire+225' },
    { code: '385', label: '🇭🇷 +385', name: '🇭🇷 Croatia (Hrvatska)+385' },
    { code: '53', label: '🇨🇺 +53', name: '🇨🇺 Cuba+53' },
    { code: '599', label: '🇨🇼 +599', name: '🇨🇼 Curaçao+599' },
    { code: '357', label: '🇨🇾 +357', name: '🇨🇾 Cyprus (Κύπρος)+357' },
    { code: '420', label: '🇨🇿 +420', name: '🇨🇿 Czech Republic (Česká republika)+420' },
    { code: '45', label: '🇩🇰 +45', name: '🇩🇰 Denmark (Danmark)+45' },
    { code: '253', label: '🇩🇯 +253', name: '🇩🇯 Djibouti+253' },
    { code: '1', label: '🇩🇲 +1', name: '🇩🇲 Dominica+1' },
    { code: '1', label: '🇩🇴 +1', name: '🇩🇴 Dominican Republic (República Dominicana)+1' },
    { code: '593', label: '🇪🇨 +593', name: '🇪🇨 Ecuador+593' },
    { code: '20', label: '🇪🇬 +20', name: '🇪🇬 Egypt (مصر)+20' },
    { code: '503', label: '🇸🇻 +503', name: '🇸🇻 El Salvador+503' },
    { code: '240', label: '🇬🇶 +240', name: '🇬🇶 Equatorial Guinea (Guinea Ecuatorial)+240' },
    { code: '291', label: '🇪🇷 +291', name: '🇪🇷 Eritrea+291' },
    { code: '372', label: '🇪🇪 +372', name: '🇪🇪 Estonia (Eesti)+372' },
    { code: '251', label: '🇪🇹 +251', name: '🇪🇹 Ethiopia+251' },
    { code: '500', label: '🇫🇰 +500', name: '🇫🇰 Falkland Islands (Islas Malvinas)+500' },
    { code: '298', label: '🇫🇴 +298', name: '🇫🇴 Faroe Islands (Føroyar)+298' },
    { code: '679', label: '🇫🇯 +679', name: '🇫🇯 Fiji+679' },
    { code: '358', label: '🇫🇮 +358', name: '🇫🇮 Finland (Suomi)+358' },
    { code: '33', label: '🇫🇷 +33', name: '🇫🇷 France+33' },
    { code: '594', label: '🇬🇫 +594', name: '🇬🇫 French Guiana (Guyane française)+594' },
    { code: '689', label: '🇵🇫 +689', name: '🇵🇫 French Polynesia (Polynésie française)+689' },
    { code: '241', label: '🇬🇦 +241', name: '🇬🇦 Gabon+241' },
    { code: '220', label: '🇬🇲 +220', name: '🇬🇲 Gambia+220' },
    { code: '995', label: '🇬🇪 +995', name: '🇬🇪 Georgia (საქართველო)+995' },
    { code: '49', label: '🇩🇪 +49', name: '🇩🇪 Germany (Deutschland)+49' },
    { code: '233', label: '🇬🇭 +233', name: '🇬🇭 Ghana (Gaana)+233' },
    { code: '350', label: '🇬🇮 +350', name: '🇬🇮 Gibraltar+350' },
    { code: '30', label: '🇬🇷 +30', name: '🇬🇷 Greece (Ελλάδα)+30' },
    { code: '299', label: '🇬🇱 +299', name: '🇬🇱 Greenland (Kalaallit Nunaat)+299' },
    { code: '1', label: '🇬🇩 +1', name: '🇬🇩 Grenada+1' },
    { code: '590', label: '🇬🇵 +590', name: '🇬🇵 Guadeloupe+590' },
    { code: '1', label: '🇬🇺 +1', name: '🇬🇺 Guam+1' },
    { code: '502', label: '🇬🇹 +502', name: '🇬🇹 Guatemala+502' },
    { code: '44', label: '🇬🇬 +44', name: '🇬🇬 Guernsey+44' },
    { code: '224', label: '🇬🇳 +224', name: '🇬🇳 Guinea (Guinée)+224' },
    { code: '245', label: '🇬🇼 +245', name: '🇬🇼 Guinea-Bissau (Guiné Bissau)+245' },
    { code: '592', label: '🇬🇾 +592', name: '🇬🇾 Guyana+592' },
    { code: '509', label: '🇭🇹 +509', name: '🇭🇹 Haiti+509' },
    { code: '504', label: '🇭🇳 +504', name: '🇭🇳 Honduras+504' },
    { code: '852', label: '🇭🇰 +852', name: '🇭🇰 Hong Kong (香港)+852' },
    { code: '36', label: '🇭🇺 +36', name: '🇭🇺 Hungary (Magyarország)+36' },
    { code: '354', label: '🇮🇸 +354', name: '🇮🇸 Iceland (Ísland)+354' },
    { code: '91', label: '🇮🇳 +91', name: '🇮🇳 India (भारत)+91' },
    { code: '62', label: '🇮🇩 +62', name: '🇮🇩 Indonesia+62' },
    { code: '98', label: '🇮🇷 +98', name: '🇮🇷 Iran (ایران)+98' },
    { code: '964', label: '🇮🇶 +964', name: '🇮🇶 Iraq (العراق)+964' },
    { code: '353', label: '🇮🇪 +353', name: '🇮🇪 Ireland+353' },
    { code: '44', label: '🇮🇲 +44', name: '🇮🇲 Isle of Man+44' },
    { code: '972', label: '🇮🇱 +972', name: '🇮🇱 Israel (ישראל)+972' },
    { code: '39', label: '🇮🇹 +39', name: '🇮🇹 Italy (Italia)+39' },
    { code: '1', label: '🇯🇲 +1', name: '🇯🇲 Jamaica+1' },
    { code: '81', label: '🇯🇵 +81', name: '🇯🇵 Japan (日本)+81' },
    { code: '44', label: '🇯🇪 +44', name: '🇯🇪 Jersey+44' },
    { code: '962', label: '🇯🇴 +962', name: '🇯🇴 Jordan (الأردن)+962' },
    { code: '7', label: '🇰🇿 +7', name: '🇰🇿 Kazakhstan (Казахстан)+7' },
    { code: '254', label: '🇰🇪 +254', name: '🇰🇪 Kenya+254' },
    { code: '686', label: '🇰🇮 +686', name: '🇰🇮 Kiribati+686' },
    { code: '383', label: '🇽🇰 +383', name: '🇽🇰 Kosovo+383' },
    { code: '965', label: '🇰🇼 +965', name: '🇰🇼 Kuwait (الكويت)+965' },
    { code: '996', label: '🇰🇬 +996', name: '🇰🇬 Kyrgyzstan (Кыргызстан)+996' },
    { code: '856', label: '🇱🇦 +856', name: '🇱🇦 Laos (ລາວ)+856' },
    { code: '371', label: '🇱🇻 +371', name: '🇱🇻 Latvia (Latvija)+371' },
    { code: '961', label: '🇱🇧 +961', name: '🇱🇧 Lebanon (لبنان)+961' },
    { code: '266', label: '🇱🇸 +266', name: '🇱🇸 Lesotho+266' },
    { code: '231', label: '🇱🇷 +231', name: '🇱🇷 Liberia+231' },
    { code: '218', label: '🇱🇾 +218', name: '🇱🇾 Libya (ليبيا)+218' },
    { code: '423', label: '🇱🇮 +423', name: '🇱🇮 Liechtenstein+423' },
    { code: '370', label: '🇱🇹 +370', name: '🇱🇹 Lithuania (Lietuva)+370' },
    { code: '352', label: '🇱🇺 +352', name: '🇱🇺 Luxembourg+352' },
    { code: '853', label: '🇲🇴 +853', name: '🇲🇴 Macau (澳門)+853' },
    { code: '389', label: '🇲🇰 +389', name: '🇲🇰 Macedonia (Македонија)+389' },
    { code: '261', label: '🇲🇬 +261', name: '🇲🇬 Madagascar (Madagasikara)+261' },
    { code: '265', label: '🇲🇼 +265', name: '🇲🇼 Malawi+265' },
    { code: '60', label: '🇲🇾 +60', name: '🇲🇾 Malaysia+60' },
    { code: '960', label: '🇲🇻 +960', name: '🇲🇻 Maldives+960' },
    { code: '223', label: '🇲🇱 +223', name: '🇲🇱 Mali+223' },
    { code: '356', label: '🇲🇹 +356', name: '🇲🇹 Malta+356' },
    { code: '692', label: '🇲🇭 +692', name: '🇲🇭 Marshall Islands+692' },
    { code: '596', label: '🇲🇶 +596', name: '🇲🇶 Martinique+596' },
    { code: '222', label: '🇲🇷 +222', name: '🇲🇷 Mauritania (موريتانيا)+222' },
    { code: '230', label: '🇲🇺 +230', name: '🇲🇺 Mauritius (Moris)+230' },
    { code: '262', label: '🇾🇹 +262', name: '🇾🇹 Mayotte+262' },
    { code: '52', label: '🇲🇽 +52', name: '🇲🇽 Mexico (México)+52' },
    { code: '691', label: '🇫🇲 +691', name: '🇫🇲 Micronesia+691' },
    { code: '373', label: '🇲🇩 +373', name: '🇲🇩 Moldova (Republica Moldova)+373' },
    { code: '377', label: '🇲🇨 +377', name: '🇲🇨 Monaco+377' },
    { code: '976', label: '🇲🇳 +976', name: '🇲🇳 Mongolia (Монгол)+976' },
    { code: '382', label: '🇲🇪 +382', name: '🇲🇪 Montenegro (Crna Gora)+382' },
    { code: '1', label: '🇲🇸 +1', name: '🇲🇸 Montserrat+1' },
    { code: '212', label: '🇲🇦 +212', name: '🇲🇦 Morocco (المغرب)+212' },
    { code: '258', label: '🇲🇿 +258', name: '🇲🇿 Mozambique (Moçambique)+258' },
    { code: '95', label: '🇲🇲 +95', name: '🇲🇲 Myanmar (Burma) (မြန်မာ)+95' },
    { code: '264', label: '🇳🇦 +264', name: '🇳🇦 Namibia (Namibië)+264' },
    { code: '674', label: '🇳🇷 +674', name: '🇳🇷 Nauru+674' },
    { code: '977', label: '🇳🇵 +977', name: '🇳🇵 Nepal (नेपाल)+977' },
    { code: '31', label: '🇳🇱 +31', name: '🇳🇱 Netherlands (Nederland)+31' },
    { code: '687', label: '🇳🇨 +687', name: '🇳🇨 New Caledonia (Nouvelle-Calédonie)+687' },
    { code: '64', label: '🇳🇿 +64', name: '🇳🇿 New Zealand+64' },
    { code: '505', label: '🇳🇮 +505', name: '🇳🇮 Nicaragua+505' },
    { code: '227', label: '🇳🇪 +227', name: '🇳🇪 Niger (Nijar)+227' },
    { code: '234', label: '🇳🇬 +234', name: '🇳🇬 Nigeria+234' },
    { code: '683', label: '🇳🇺 +683', name: '🇳🇺 Niue+683' },
    { code: '672', label: '🇳🇫 +672', name: '🇳🇫 Norfolk Island+672' },
    { code: '850', label: '🇰🇵 +850', name: '🇰🇵 North Korea (조선 민주주의 인민 공화국)+850' },
    { code: '1', label: '🇲🇵 +1', name: '🇲🇵 Northern Mariana Islands+1' },
    { code: '47', label: '🇳🇴 +47', name: '🇳🇴 Norway (Norge)+47' },
    { code: '968', label: '🇴🇲 +968', name: '🇴🇲 Oman (عُمان)+968' },
    { code: '92', label: '🇵🇰 +92', name: '🇵🇰 Pakistan (پاکستان)+92' },
    { code: '680', label: '🇵🇼 +680', name: '🇵🇼 Palau+680' },
    { code: '970', label: '🇵🇸 +970', name: '🇵🇸 Palestine (فلسطين)+970' },
    { code: '507', label: '🇵🇦 +507', name: '🇵🇦 Panama (Panamá)+507' },
    { code: '675', label: '🇵🇬 +675', name: '🇵🇬 Papua New Guinea+675' },
    { code: '595', label: '🇵🇾 +595', name: '🇵🇾 Paraguay+595' },
    { code: '51', label: '🇵🇪 +51', name: '🇵🇪 Peru (Perú)+51' },
    { code: '63', label: '🇵🇭 +63', name: '🇵🇭 Philippines+63' },
    { code: '48', label: '🇵🇱 +48', name: '🇵🇱 Poland (Polska)+48' },
    { code: '351', label: '🇵🇹 +351', name: '🇵🇹 Portugal+351' },
    { code: '1', label: '🇵🇷 +1', name: '🇵🇷 Puerto Rico+1' },
    { code: '974', label: '🇶🇦 +974', name: '🇶🇦 Qatar (قطر)+974' },
    { code: '262', label: '🇷🇪 +262', name: '🇷🇪 Réunion (La Réunion)+262' },
    { code: '40', label: '🇷🇴 +40', name: '🇷🇴 Romania (România)+40' },
    { code: '7', label: '🇷🇺 +7', name: '🇷🇺 Russia (Россия)+7' },
    { code: '250', label: '🇷🇼 +250', name: '🇷🇼 Rwanda+250' },
    { code: '590', label: '🇧🇱 +590', name: '🇧🇱 Saint Barthélemy+590' },
    { code: '290', label: '🇸🇭 +290', name: '🇸🇭 Saint Helena+290' },
    { code: '1', label: '🇰🇳 +1', name: '🇰🇳 Saint Kitts and Nevis+1' },
    { code: '1', label: '🇱🇨 +1', name: '🇱🇨 Saint Lucia+1' },
    { code: '590', label: '🇲🇫 +590', name: '🇲🇫 Saint Martin (Saint-Martin (partie française))+590' },
    { code: '508', label: '🇵🇲 +508', name: '🇵🇲 Saint Pierre and Miquelon (Saint-Pierre-et-Miquelon)+508' },
    { code: '1', label: '🇻🇨 +1', name: '🇻🇨 Saint Vincent and the Grenadines+1' },
    { code: '685', label: '🇼🇸 +685', name: '🇼🇸 Samoa+685' },
    { code: '378', label: '🇸🇲 +378', name: '🇸🇲 San Marino+378' },
    { code: '239', label: '🇸🇹 +239', name: '🇸🇹 São Tomé and Príncipe (São Tomé e Príncipe)+239' },
    { code: '966', label: '🇸🇦 +966', name: '🇸🇦 Saudi Arabia (المملكة العربية السعودية)+966' },
    { code: '221', label: '🇸🇳 +221', name: '🇸🇳 Senegal (Sénégal)+221' },
    { code: '381', label: '🇷🇸 +381', name: '🇷🇸 Serbia (Србија)+381' },
    { code: '248', label: '🇸🇨 +248', name: '🇸🇨 Seychelles+248' },
    { code: '232', label: '🇸🇱 +232', name: '🇸🇱 Sierra Leone+232' },
    { code: '65', label: '🇸🇬 +65', name: '🇸🇬 Singapore+65' },
    { code: '1', label: '🇸🇽 +1', name: '🇸🇽 Sint Maarten+1' },
    { code: '421', label: '🇸🇰 +421', name: '🇸🇰 Slovakia (Slovensko)+421' },
    { code: '386', label: '🇸🇮 +386', name: '🇸🇮 Slovenia (Slovenija)+386' },
    { code: '677', label: '🇸🇧 +677', name: '🇸🇧 Solomon Islands+677' },
    { code: '252', label: '🇸🇴 +252', name: '🇸🇴 Somalia (Soomaaliya)+252' },
    { code: '27', label: '🇿🇦 +27', name: '🇿🇦 South Africa+27' },
    { code: '82', label: '🇰🇷 +82', name: '🇰🇷 South Korea (대한민국)+82' },
    { code: '211', label: '🇸🇸 +211', name: '🇸🇸 South Sudan (جنوب السودان)+211' },
    { code: '34', label: '🇪🇸 +34', name: '🇪🇸 Spain (España)+34' },
    { code: '94', label: '🇱🇰 +94', name: '🇱🇰 Sri Lanka (ශ්‍රී ලංකාව)+94' },
    { code: '249', label: '🇸🇩 +249', name: '🇸🇩 Sudan (السودان)+249' },
    { code: '597', label: '🇸🇷 +597', name: '🇸🇷 Suriname+597' },
    { code: '47', label: '🇸🇯 +47', name: '🇸🇯 Svalbard and Jan Mayen+47' },
    { code: '268', label: '🇸🇿 +268', name: '🇸🇿 Swaziland+268' },
    { code: '46', label: '🇸🇪 +46', name: '🇸🇪 Sweden (Sverige)+46' },
    { code: '41', label: '🇨🇭 +41', name: '🇨🇭 Switzerland (Schweiz)+41' },
    { code: '963', label: '🇸🇾 +963', name: '🇸🇾 Syria (سوريا)+963' },
    { code: '886', label: '🇹🇼 +886', name: '🇹🇼 Taiwan (台灣)+886' },
    { code: '992', label: '🇹🇯 +992', name: '🇹🇯 Tajikistan+992' },
    { code: '255', label: '🇹🇿 +255', name: '🇹🇿 Tanzania+255' },
    { code: '66', label: '🇹🇭 +66', name: '🇹🇭 Thailand (ไทย)+66' },
    { code: '670', label: '🇹🇱 +670', name: '🇹🇱 Timor-Leste+670' },
    { code: '228', label: '🇹🇬 +228', name: '🇹🇬 Togo+228' },
    { code: '690', label: '🇹🇰 +690', name: '🇹🇰 Tokelau+690' },
    { code: '676', label: '🇹🇴 +676', name: '🇹🇴 Tonga+676' },
    { code: '1', label: '🇹🇹 +1', name: '🇹🇹 Trinidad and Tobago+1' },
    { code: '216', label: '🇹🇳 +216', name: '🇹🇳 Tunisia (تونس)+216' },
    { code: '90', label: '🇹🇷 +90', name: '🇹🇷 Turkey (Türkiye)+90' },
    { code: '993', label: '🇹🇲 +993', name: '🇹🇲 Turkmenistan+993' },
    { code: '1', label: '🇹🇨 +1', name: '🇹🇨 Turks and Caicos Islands+1' },
    { code: '688', label: '🇹🇻 +688', name: '🇹🇻 Tuvalu+688' },
    { code: '1', label: '🇻🇮 +1', name: '🇻🇮 U.S. Virgin Islands+1' },
    { code: '256', label: '🇺🇬 +256', name: '🇺🇬 Uganda+256' },
    { code: '380', label: '🇺🇦 +380', name: '🇺🇦 Ukraine (Україна)+380' },
    { code: '971', label: '🇦🇪 +971', name: '🇦🇪 United Arab Emirates (الإمارات العربية المتحدة)+971' },
    { code: '44', label: '🇬🇧 +44', name: '🇬🇧 United Kingdom+44' },
    { code: '1', label: '🇺🇸 +1', name: '🇺🇸 United States+1' },
    { code: '598', label: '🇺🇾 +598', name: '🇺🇾 Uruguay+598' },
    { code: '998', label: '🇺🇿 +998', name: '🇺🇿 Uzbekistan (Oʻzbekiston)+998' },
    { code: '678', label: '🇻🇺 +678', name: '🇻🇺 Vanuatu+678' },
    { code: '39', label: '🇻🇦 +39', name: '🇻🇦 Vatican City (Città del Vaticano)+39' },
    { code: '58', label: '🇻🇪 +58', name: '🇻🇪 Venezuela+58' },
    { code: '84', label: '🇻🇳 +84', name: '🇻🇳 Vietnam (Việt Nam)+84' },
    { code: '681', label: '🇼🇫 +681', name: '🇼🇫 Wallis and Futuna (Wallis-et-Futuna)+681' },
    { code: '212', label: '🇪🇭 +212', name: '🇪🇭 Western Sahara (الصحراء الغربية)+212' },
    { code: '967', label: '🇾🇪 +967', name: '🇾🇪 Yemen (اليمن)+967' },
    { code: '260', label: '🇿🇲 +260', name: '🇿🇲 Zambia+260' },
    { code: '263', label: '🇿🇼 +263', name: '🇿🇼 Zimbabwe+263' },
    { code: '358', label: '🇦🇽 +358', name: '🇦🇽 Åland Islands+358' },
    { code: 'outro', label: '🌎 Outro', name: '🌎 Outro país' }
];

let selectedCountryModal = countries.find(c => c.code === '55');

function renderOptionsModal() {
    const container = document.getElementById('customOptionsModal');
    if (!container) return;
    container.innerHTML = countries.map(c =>
        `<div class="custom-option${c.code === selectedCountryModal.code ? ' selected' : ''}" data-code="${c.code}" data-label="${c.label}" data-name="${c.name}" style="padding: 10px 12px; cursor: pointer; color: white; font-size: 14px; white-space: nowrap;">${c.name}</div>`
    ).join('');

    document.querySelectorAll('#customOptionsModal .custom-option').forEach(opt => {
        opt.addEventListener('mouseenter', () => opt.style.background = 'rgba(77,168,218,0.2)');
        opt.addEventListener('mouseleave', () => opt.style.background = opt.classList.contains('selected') ? 'rgba(77,168,218,0.2)' : '');
        opt.addEventListener('click', function(e) {
            e.stopPropagation();
            const code = this.dataset.code;
            const label = this.dataset.label;
            selectedCountryModal = countries.find(c => c.code === code);
            const selectEl = document.getElementById('customSelectModal');
            if (selectEl) selectEl.textContent = label;
            const optionsEl = document.getElementById('customOptionsModal');
            if (optionsEl) optionsEl.style.display = 'none';
            renderOptionsModal();
            atualizarPlaceholderModal(code);
            const whatsappInput = document.getElementById('portalWhatsApp');
            if (whatsappInput) whatsappInput.value = '';
            const erroWhatsapp = document.getElementById('erroWhatsapp');
            if (erroWhatsapp) erroWhatsapp.style.display = 'none';
        });
    });
}

function atualizarPlaceholderModal(ddi) {
    const input = document.getElementById('portalWhatsApp');
    if (!input) return;
    input.placeholder = (ddi === '55') ? '(DDD) 9 9999-9999' : 'Número sem formatação';
}

function aplicarMascaraModal(event) {
    const input = event.target;
    const ddi = selectedCountryModal ? selectedCountryModal.code : '55';
    if (ddi === '55') {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length > 11) valor = valor.slice(0, 11);
        let formatado = '';
        if (valor.length > 0) formatado += '(' + valor.substring(0,2);
        if (valor.length > 2) formatado += ') ' + valor.substring(2,3);
        if (valor.length > 3) formatado += ' ' + valor.substring(3,7);
        if (valor.length > 7) formatado += '-' + valor.substring(7,11);
        let cursor = input.selectionStart;
        let diff = formatado.length - input.value.length;
        input.value = formatado;
        input.setSelectionRange(cursor + diff, cursor + diff);
    } else {
        let digits = input.value.replace(/\D/g, '');
        if (digits.length > 15) digits = digits.slice(0, 15);
        input.value = digits;
    }
}

function abrirPortalCat(id) {
    const evento = EV.find(ev => ev.id === id);
    if (!evento) {
        toast('⚠️ Evento não encontrado.');
        return;
    }

    eventoSelecionadoId = id;

    // Logo do evento
    const logoGrande = document.getElementById('portalLogoGrande');
    const urlLogo = evento.logoUrl;
    console.log('🔍 Logo recebida no portal:', urlLogo, '| Tipo:', typeof urlLogo);
    if (logoGrande) {
        if (urlLogo && typeof urlLogo === 'string' && urlLogo.trim().length > 10 && (urlLogo.startsWith('http') || urlLogo.startsWith('data:'))) {
            logoGrande.innerHTML = `<img src="${urlLogo}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none'">`;
            console.log('✅ Logo exibida');
        } else {
            logoGrande.innerHTML = '<span style="font-size:48px;">🎪</span>';
            console.log('⚠️ Logo não encontrada ou inválida, exibindo fallback');
        }
    }

    // Patrocinadores – aceita tanto array quanto string JSON
    const logosRaw = evento.patrocinadoresLogos;
    let logos = [];
    if (Array.isArray(logosRaw)) {
        logos = logosRaw;
    } else if (typeof logosRaw === 'string') {
        try {
            logos = JSON.parse(logosRaw);
        } catch (e) {
            logos = [];
        }
    }
    const logosValidos = logos.filter(url => typeof url === 'string' && url.length > 20 && (url.startsWith('http') || url.startsWith('data:')));

    const faixa = document.getElementById('carrosselFaixa');
    if (faixa) {
        if (logosValidos.length > 4) {
            const duplicados = [...logosValidos, ...logosValidos];
            faixa.innerHTML = duplicados.map(url => `<img src="${url}" alt="Patrocinador" onerror="this.style.display='none'">`).join('');
            faixa.style.animation = 'scrollPatrocinadores 20s linear infinite';
        } else if (logosValidos.length > 0) {
            faixa.innerHTML = logosValidos.map(url => `<img src="${url}" alt="Patrocinador" onerror="this.style.display='none'">`).join('');
            faixa.style.animation = 'none';
        } else {
            faixa.innerHTML = '';
        }
    }

    // Resetar seletor de país
    selectedCountryModal = countries.find(c => c.code === '55');
    const selectEl = document.getElementById('customSelectModal');
    if (selectEl) selectEl.textContent = selectedCountryModal.label;
    renderOptionsModal();

    const optionsEl = document.getElementById('customOptionsModal');
    if (optionsEl) optionsEl.style.display = 'none';

    if (selectEl) {
        selectEl.onclick = function(e) {
            e.stopPropagation();
            const opt = document.getElementById('customOptionsModal');
            if (opt) opt.style.display = (opt.style.display === 'block') ? 'none' : 'block';
        };
    }

    const whatsappInput = document.getElementById('portalWhatsApp');
    if (whatsappInput) {
        whatsappInput.value = '';
        whatsappInput.placeholder = '(DDD) 9 9999-9999';
        whatsappInput.removeEventListener('input', aplicarMascaraModal);
        whatsappInput.addEventListener('input', aplicarMascaraModal);
    }
    ['portalNome','portalEmail'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const lgpdCheck = document.getElementById('portalLGPD');
    if (lgpdCheck) lgpdCheck.checked = false;
    const lgpdError = document.getElementById('lgpdError');
    if (lgpdError) lgpdError.style.display = 'none';
    const erroWhatsapp = document.getElementById('erroWhatsapp');
    if (erroWhatsapp) erroWhatsapp.style.display = 'none';

    abrirModal('portalModal');
}

function formatWhatsApp(input) {
    let valor = input.value.replace(/[^\d+\-() ]/g, '');
    input.value = valor;
}

function detectarDispositivoAdmin() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Mobile/.test(ua)) return 'Mobile';
    return 'Desktop';
}

async function simularConexao() {
    const erroWhatsapp = document.getElementById('erroWhatsapp');
    if (erroWhatsapp) erroWhatsapp.style.display = 'none';

    const nome = document.getElementById('portalNome')?.value.trim();
    const email = document.getElementById('portalEmail')?.value.trim();
    const whatsapp = document.getElementById('portalWhatsApp')?.value.trim();
    const ddi = selectedCountryModal ? selectedCountryModal.code : '55';

    if (!nome) { alert('⚠️ Preencha seu nome!'); return; }
    if (!email) { alert('⚠️ Preencha seu e-mail!'); return; }

    if (whatsapp) {
        const digits = whatsapp.replace(/\D/g, '');
        if (ddi === '55') {
            if (digits.length !== 10 && digits.length !== 11) {
                if (erroWhatsapp) {
                    erroWhatsapp.textContent = 'Número inválido para o Brasil. Use 10 ou 11 dígitos (com DDD).';
                    erroWhatsapp.style.display = 'block';
                }
                return;
            }
        } else {
            if (digits.length < 7 || digits.length > 15) {
                if (erroWhatsapp) {
                    erroWhatsapp.textContent = 'Número inválido (mín. 7 dígitos, máx. 15).';
                    erroWhatsapp.style.display = 'block';
                }
                return;
            }
        }
    }

    const lgpdError = document.getElementById('lgpdError');
    if (!document.getElementById('portalLGPD')?.checked) {
        if (lgpdError) lgpdError.style.display = 'block';
        return;
    }

    // Obtém o evento a partir do ID selecionado ou do cliente atual
    const evento = EV.find(ev => ev.id === eventoSelecionadoId) || eventoClienteAtual;
    if (!evento) {
        alert('Evento não encontrado.');
        return;
    }

    const visitante = {
        nome: escapeHtml(nome),
        email: email,
        whatsapp: whatsapp ? '+' + ddi + ' ' + whatsapp : '(não informado)',
        acesso: new Date().toISOString(),
        hora: new Date().getHours(),
        dispositivo: detectarDispositivoAdmin(),
        ip: '0.0.0.0'
    };

    try {
        const resultado = await apiRegistrarVisitante(evento.token, visitante);
        // Após registrar o visitante, ativa o MikroTik
        try {
            await mikrotikLogin(evento.token);
        } catch (e) {
            console.warn('Falha ao ativar MikroTik:', e);
        }

        // Atualiza o totalVisitantes no array EV
        if (resultado && resultado.totalVisitantes !== null) {
            const ev = EV.find(e => e.id === evento.id);
            if (ev) ev.totalVisitantes = resultado.totalVisitantes;
            if (eventoClienteAtual && eventoClienteAtual.id === evento.id) {
                eventoClienteAtual.totalVisitantes = resultado.totalVisitantes;
            }
        }

        // Atualiza a interface (se necessário)
        if (eventoSelecionadoId === evento.id) selecionarEvento();
        if (eventoClienteAtual?.id === evento.id) await abrirAreaClienteEvento(evento);
        renderizarEventos();

        fecharModal('portalModal');
        toast('✅ Conectado!');
    } catch (e) {
        toast('❌ Erro ao registrar: ' + e.message);
    }
}

document.addEventListener('click', function(event) {
    const options = document.getElementById('customOptionsModal');
    const select = document.getElementById('customSelectModal');
    if (options && select && !select.contains(event.target) && !options.contains(event.target)) {
        options.style.display = 'none';
    }
});
