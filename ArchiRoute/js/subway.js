/**
 * subway.js — Seoul subway station name ↔ coordinate database
 * + fuzzy autocomplete helper
 *
 * Covers major stations on lines 1–9, plus Bundang/Sinbundang/Airport lines.
 * Coordinates are approximate centre-platform lat/lng.
 */

const SUBWAY_STATIONS = [
  // Line 1
  { name: '서울역', lat: 37.5547, lng: 126.9707 },
  { name: '시청', lat: 37.5651, lng: 126.9774 },
  { name: '종각', lat: 37.5700, lng: 126.9825 },
  { name: '종로3가', lat: 37.5710, lng: 126.9915 },
  { name: '종로5가', lat: 37.5712, lng: 126.9981 },
  { name: '동대문', lat: 37.5717, lng: 127.0097 },
  { name: '동묘앞', lat: 37.5742, lng: 127.0164 },
  { name: '신설동', lat: 37.5744, lng: 127.0244 },
  { name: '제기동', lat: 37.5839, lng: 127.0313 },
  { name: '청량리', lat: 37.5804, lng: 127.0459 },
  { name: '회기', lat: 37.5896, lng: 127.0564 },
  { name: '외대앞', lat: 37.5964, lng: 127.0591 },
  { name: '신이문', lat: 37.6077, lng: 127.0620 },
  { name: '석계', lat: 37.6163, lng: 127.0656 },
  { name: '광운대', lat: 37.6245, lng: 127.0618 },
  { name: '월계', lat: 37.6325, lng: 127.0558 },
  { name: '녹천', lat: 37.6405, lng: 127.0520 },
  { name: '창동', lat: 37.6534, lng: 127.0476 },
  { name: '도봉', lat: 37.6627, lng: 127.0441 },
  { name: '도봉산', lat: 37.6880, lng: 127.0459 },
  { name: '망월사', lat: 37.6974, lng: 127.0434 },
  { name: '의정부', lat: 37.7383, lng: 127.0434 },
  { name: '구로', lat: 37.5003, lng: 126.8832 },
  { name: '구일', lat: 37.4933, lng: 126.8731 },
  { name: '개봉', lat: 37.4928, lng: 126.8609 },
  { name: '오류동', lat: 37.4967, lng: 126.8484 },
  { name: '온수', lat: 37.4989, lng: 126.8255 },
  { name: '역곡', lat: 37.4873, lng: 126.8018 },
  { name: '소사', lat: 37.4836, lng: 126.7879 },
  { name: '부천', lat: 37.5003, lng: 126.7869 },
  { name: '중동', lat: 37.5043, lng: 126.7647 },
  { name: '부평구청', lat: 37.5085, lng: 126.7225 },
  { name: '부평', lat: 37.4891, lng: 126.7244 },
  { name: '인천', lat: 37.4740, lng: 126.6218 },
  { name: '노량진', lat: 37.5143, lng: 126.9427 },
  { name: '대방', lat: 37.5121, lng: 126.9284 },
  { name: '신길', lat: 37.5116, lng: 126.9205 },
  { name: '영등포', lat: 37.5162, lng: 126.9067 },
  { name: '신도림', lat: 37.5088, lng: 126.8912 },
  { name: '가산디지털단지', lat: 37.4813, lng: 126.8822 },
  { name: '독산', lat: 37.4759, lng: 126.8973 },
  { name: '금천구청', lat: 37.4567, lng: 126.8995 },
  { name: '석수', lat: 37.4494, lng: 126.9154 },
  { name: '관악', lat: 37.4600, lng: 126.9315 },
  { name: '안양', lat: 37.3999, lng: 126.9227 },
  { name: '명학', lat: 37.3968, lng: 126.9323 },
  { name: '금정', lat: 37.3744, lng: 126.9282 },
  { name: '군포', lat: 37.3597, lng: 126.9348 },
  { name: '의왕', lat: 37.3417, lng: 126.9681 },
  { name: '성균관대', lat: 37.3002, lng: 127.0115 },
  { name: '화서', lat: 37.2884, lng: 126.9922 },
  { name: '수원', lat: 37.2663, lng: 127.0005 },

  // Line 2
  { name: '시청(2)', lat: 37.5651, lng: 126.9774 },
  { name: '을지로입구', lat: 37.5661, lng: 126.9823 },
  { name: '을지로3가', lat: 37.5661, lng: 126.9909 },
  { name: '을지로4가', lat: 37.5669, lng: 126.9981 },
  { name: '동대문역사문화공원', lat: 37.5650, lng: 127.0092 },
  { name: '신당', lat: 37.5641, lng: 127.0199 },
  { name: '상왕십리', lat: 37.5614, lng: 127.0295 },
  { name: '왕십리', lat: 37.5612, lng: 127.0373 },
  { name: '한양대', lat: 37.5553, lng: 127.0459 },
  { name: '뚝섬', lat: 37.5471, lng: 127.0476 },
  { name: '성수', lat: 37.5446, lng: 127.0558 },
  { name: '건대입구', lat: 37.5402, lng: 127.0699 },
  { name: '구의', lat: 37.5375, lng: 127.0892 },
  { name: '강변', lat: 37.5349, lng: 127.1004 },
  { name: '잠실나루', lat: 37.5178, lng: 127.1004 },
  { name: '잠실', lat: 37.5133, lng: 127.1000 },
  { name: '잠실새내', lat: 37.5102, lng: 127.0820 },
  { name: '종합운동장', lat: 37.5102, lng: 127.0732 },
  { name: '삼성', lat: 37.5088, lng: 127.0632 },
  { name: '선릉', lat: 37.5047, lng: 127.0485 },
  { name: '역삼', lat: 37.5003, lng: 127.0362 },
  { name: '강남', lat: 37.4979, lng: 127.0280 },
  { name: '교대(2)', lat: 37.4939, lng: 127.0138 },
  { name: '서초', lat: 37.4836, lng: 127.0115 },
  { name: '방배', lat: 37.4813, lng: 126.9981 },
  { name: '사당', lat: 37.4761, lng: 126.9819 },
  { name: '낙성대', lat: 37.4759, lng: 126.9638 },
  { name: '서울대입구', lat: 37.4813, lng: 126.9521 },
  { name: '봉천', lat: 37.4836, lng: 126.9427 },
  { name: '신림', lat: 37.4839, lng: 126.9293 },
  { name: '신대방', lat: 37.4878, lng: 126.9138 },
  { name: '구로디지털단지', lat: 37.4851, lng: 126.9015 },
  { name: '대림', lat: 37.4939, lng: 126.8951 },
  { name: '문래', lat: 37.5188, lng: 126.8973 },
  { name: '영등포구청', lat: 37.5261, lng: 126.8963 },
  { name: '당산', lat: 37.5344, lng: 126.9015 },
  { name: '합정', lat: 37.5497, lng: 126.9138 },
  { name: '홍대입구', lat: 37.5571, lng: 126.9227 },
  { name: '신촌', lat: 37.5553, lng: 126.9370 },
  { name: '이대', lat: 37.5553, lng: 126.9456 },
  { name: '아현', lat: 37.5564, lng: 126.9565 },
  { name: '충정로', lat: 37.5611, lng: 126.9640 },

  // Line 3
  { name: '지축', lat: 37.6676, lng: 126.9227 },
  { name: '구파발', lat: 37.6529, lng: 126.9205 },
  { name: '연신내', lat: 37.6191, lng: 126.9227 },
  { name: '불광', lat: 37.6098, lng: 126.9293 },
  { name: '녹번', lat: 37.6017, lng: 126.9348 },
  { name: '홍제', lat: 37.5940, lng: 126.9456 },
  { name: '무악재', lat: 37.5862, lng: 126.9565 },
  { name: '독립문', lat: 37.5841, lng: 126.9598 },
  { name: '경복궁', lat: 37.5796, lng: 126.9718 },
  { name: '안국', lat: 37.5779, lng: 126.9846 },
  { name: '종로3가(3)', lat: 37.5710, lng: 126.9915 },
  { name: '을지로3가(3)', lat: 37.5661, lng: 126.9909 },
  { name: '충무로', lat: 37.5611, lng: 126.9981 },
  { name: '동대입구', lat: 37.5583, lng: 127.0059 },
  { name: '약수', lat: 37.5553, lng: 127.0138 },
  { name: '금호', lat: 37.5497, lng: 127.0199 },
  { name: '옥수', lat: 37.5440, lng: 127.0199 },
  { name: '압구정', lat: 37.5265, lng: 127.0295 },
  { name: '신사', lat: 37.5218, lng: 127.0199 },
  { name: '잠원', lat: 37.5151, lng: 127.0115 },
  { name: '고속터미널', lat: 37.5047, lng: 127.0059 },
  { name: '교대', lat: 37.4939, lng: 127.0138 },
  { name: '남부터미널', lat: 37.4836, lng: 127.0138 },
  { name: '양재', lat: 37.4836, lng: 127.0362 },
  { name: '매봉', lat: 37.4873, lng: 127.0540 },
  { name: '도곡', lat: 37.4939, lng: 127.0540 },
  { name: '대치', lat: 37.4939, lng: 127.0632 },
  { name: '학여울', lat: 37.4939, lng: 127.0820 },
  { name: '대청', lat: 37.4939, lng: 127.1004 },
  { name: '일원', lat: 37.4873, lng: 127.0820 },
  { name: '수서', lat: 37.4878, lng: 127.1004 },
  { name: '복정', lat: 37.4817, lng: 127.1245 },

  // Line 4
  { name: '노원', lat: 37.6534, lng: 127.0658 },
  { name: '창동(4)', lat: 37.6534, lng: 127.0476 },
  { name: '쌍문', lat: 37.6481, lng: 127.0346 },
  { name: '수유', lat: 37.6377, lng: 127.0251 },
  { name: '미아', lat: 37.6283, lng: 127.0251 },
  { name: '미아사거리', lat: 37.6133, lng: 127.0295 },
  { name: '길음', lat: 37.6032, lng: 127.0251 },
  { name: '성신여대입구', lat: 37.5940, lng: 127.0164 },
  { name: '한성대입구', lat: 37.5879, lng: 127.0059 },
  { name: '혜화', lat: 37.5820, lng: 127.0019 },
  { name: '동대문', lat: 37.5717, lng: 127.0097 },
  { name: '동대문역사문화공원(4)', lat: 37.5650, lng: 127.0092 },
  { name: '충무로(4)', lat: 37.5611, lng: 126.9981 },
  { name: '명동', lat: 37.5629, lng: 126.9872 },
  { name: '회현', lat: 37.5583, lng: 126.9774 },
  { name: '서울역(4)', lat: 37.5547, lng: 126.9707 },
  { name: '숙대입구', lat: 37.5440, lng: 126.9718 },
  { name: '삼각지', lat: 37.5349, lng: 126.9718 },
  { name: '신용산', lat: 37.5304, lng: 126.9640 },
  { name: '이촌', lat: 37.5218, lng: 126.9598 },
  { name: '동작', lat: 37.5097, lng: 126.9789 },
  { name: '이수', lat: 37.4873, lng: 126.9818 },
  { name: '사당(4)', lat: 37.4761, lng: 126.9819 },
  { name: '남태령', lat: 37.4661, lng: 126.9872 },
  { name: '선바위', lat: 37.4604, lng: 127.0059 },
  { name: '경마공원', lat: 37.4506, lng: 127.0251 },
  { name: '대공원', lat: 37.4479, lng: 127.0199 },
  { name: '과천', lat: 37.4290, lng: 126.9937 },
  { name: '정부과천청사', lat: 37.4245, lng: 126.9872 },
  { name: '인덕원', lat: 37.3908, lng: 126.9718 },
  { name: '평촌', lat: 37.3908, lng: 126.9565 },
  { name: '범계', lat: 37.3908, lng: 126.9456 },
  { name: '금정(4)', lat: 37.3744, lng: 126.9282 },
  { name: '산본', lat: 37.3597, lng: 126.9205 },

  // Line 5
  { name: '방화', lat: 37.5699, lng: 126.8013 },
  { name: '개화산', lat: 37.5583, lng: 126.8126 },
  { name: '김포공항', lat: 37.5699, lng: 126.8013 },
  { name: '송정', lat: 37.5583, lng: 126.8238 },
  { name: '마곡', lat: 37.5571, lng: 126.8347 },
  { name: '발산', lat: 37.5553, lng: 126.8484 },
  { name: '우장산', lat: 37.5497, lng: 126.8609 },
  { name: '화곡', lat: 37.5440, lng: 126.8731 },
  { name: '까치산', lat: 37.5395, lng: 126.8832 },
  { name: '신정', lat: 37.5261, lng: 126.8963 },
  { name: '목동', lat: 37.5261, lng: 126.8771 },
  { name: '오목교', lat: 37.5261, lng: 126.8609 },
  { name: '양평', lat: 37.5261, lng: 126.8973 },
  { name: '영등포구청(5)', lat: 37.5261, lng: 126.8963 },
  { name: '영등포시장', lat: 37.5188, lng: 126.9015 },
  { name: '신길(5)', lat: 37.5116, lng: 126.9205 },
  { name: '여의도', lat: 37.5218, lng: 126.9227 },
  { name: '여의나루', lat: 37.5261, lng: 126.9293 },
  { name: '마포', lat: 37.5497, lng: 126.9456 },
  { name: '공덕', lat: 37.5440, lng: 126.9521 },
  { name: '애오개', lat: 37.5553, lng: 126.9598 },
  { name: '충정로(5)', lat: 37.5611, lng: 126.9640 },
  { name: '서대문', lat: 37.5699, lng: 126.9640 },
  { name: '광화문', lat: 37.5710, lng: 126.9774 },
  { name: '종로3가(5)', lat: 37.5710, lng: 126.9915 },
  { name: '을지로4가(5)', lat: 37.5669, lng: 126.9981 },
  { name: '동대문역사문화공원(5)', lat: 37.5650, lng: 127.0092 },
  { name: '청구', lat: 37.5603, lng: 127.0199 },
  { name: '신금호', lat: 37.5553, lng: 127.0295 },
  { name: '행당', lat: 37.5564, lng: 127.0362 },
  { name: '왕십리(5)', lat: 37.5612, lng: 127.0373 },
  { name: '마장', lat: 37.5641, lng: 127.0520 },
  { name: '답십리', lat: 37.5699, lng: 127.0540 },
  { name: '장한평', lat: 37.5699, lng: 127.0658 },
  { name: '군자', lat: 37.5583, lng: 127.0788 },
  { name: '아차산', lat: 37.5497, lng: 127.0892 },
  { name: '광나루', lat: 37.5497, lng: 127.1004 },
  { name: '천호', lat: 37.5395, lng: 127.1245 },
  { name: '강동', lat: 37.5311, lng: 127.1245 },
  { name: '길동', lat: 37.5304, lng: 127.1416 },
  { name: '굽은다리', lat: 37.5261, lng: 127.1328 },
  { name: '명일', lat: 37.5218, lng: 127.1416 },
  { name: '고덕', lat: 37.5151, lng: 127.1546 },
  { name: '상일동', lat: 37.5097, lng: 127.1700 },
  { name: '둔촌동', lat: 37.5047, lng: 127.1328 },
  { name: '올림픽공원', lat: 37.5097, lng: 127.1159 },
  { name: '방이', lat: 37.5097, lng: 127.1004 },
  { name: '오금', lat: 37.5003, lng: 127.1245 },
  { name: '개롱', lat: 37.4939, lng: 127.1416 },
  { name: '거여', lat: 37.4939, lng: 127.1546 },
  { name: '마천', lat: 37.4873, lng: 127.1546 },

  // Line 6
  { name: '응암', lat: 37.5996, lng: 126.9227 },
  { name: '역촌', lat: 37.6017, lng: 126.9293 },
  { name: '불광(6)', lat: 37.6098, lng: 126.9293 },
  { name: '독바위', lat: 37.6133, lng: 126.9370 },
  { name: '연신내(6)', lat: 37.6191, lng: 126.9227 },
  { name: '구산', lat: 37.6133, lng: 126.9138 },
  { name: '새절', lat: 37.5996, lng: 126.9138 },
  { name: '증산', lat: 37.5820, lng: 126.9138 },
  { name: '디지털미디어시티', lat: 37.5783, lng: 126.8963 },
  { name: '월드컵경기장', lat: 37.5699, lng: 126.8985 },
  { name: '마포구청', lat: 37.5611, lng: 126.9138 },
  { name: '망원', lat: 37.5553, lng: 126.9138 },
  { name: '합정(6)', lat: 37.5497, lng: 126.9138 },
  { name: '상수', lat: 37.5497, lng: 126.9227 },
  { name: '광흥창', lat: 37.5497, lng: 126.9348 },
  { name: '대흥', lat: 37.5497, lng: 126.9456 },
  { name: '공덕(6)', lat: 37.5440, lng: 126.9521 },
  { name: '효창공원앞', lat: 37.5395, lng: 126.9598 },
  { name: '삼각지(6)', lat: 37.5349, lng: 126.9718 },
  { name: '녹사평', lat: 37.5349, lng: 126.9872 },
  { name: '이태원', lat: 37.5349, lng: 126.9942 },
  { name: '한강진', lat: 37.5349, lng: 127.0059 },
  { name: '버티고개', lat: 37.5440, lng: 127.0138 },
  { name: '약수(6)', lat: 37.5553, lng: 127.0138 },
  { name: '청구(6)', lat: 37.5603, lng: 127.0199 },
  { name: '신당(6)', lat: 37.5641, lng: 127.0199 },
  { name: '동묘앞(6)', lat: 37.5742, lng: 127.0164 },
  { name: '창신', lat: 37.5783, lng: 127.0164 },
  { name: '보문', lat: 37.5862, lng: 127.0199 },
  { name: '안암(6)', lat: 37.5853, lng: 127.0295 },
  { name: '고려대', lat: 37.5862, lng: 127.0295 },
  { name: '월곡', lat: 37.5996, lng: 127.0295 },
  { name: '상월곡', lat: 37.6032, lng: 127.0346 },
  { name: '돌곶이', lat: 37.6098, lng: 127.0520 },
  { name: '석계(6)', lat: 37.6163, lng: 127.0656 },
  { name: '태릉입구', lat: 37.6245, lng: 127.0788 },
  { name: '화랑대', lat: 37.6283, lng: 127.0892 },
  { name: '봉화산', lat: 37.6191, lng: 127.1004 },
  { name: '신내', lat: 37.6098, lng: 127.1159 },

  // Line 7
  { name: '장암', lat: 37.7254, lng: 127.0658 },
  { name: '도봉산(7)', lat: 37.6880, lng: 127.0459 },
  { name: '수락산', lat: 37.6676, lng: 127.0658 },
  { name: '마들', lat: 37.6534, lng: 127.0788 },
  { name: '노원(7)', lat: 37.6534, lng: 127.0658 },
  { name: '중계', lat: 37.6377, lng: 127.0658 },
  { name: '하계', lat: 37.6283, lng: 127.0658 },
  { name: '공릉', lat: 37.6191, lng: 127.0658 },
  { name: '태릉입구(7)', lat: 37.6245, lng: 127.0788 },
  { name: '먹골', lat: 37.6133, lng: 127.0892 },
  { name: '중화', lat: 37.6032, lng: 127.0788 },
  { name: '상봉', lat: 37.5996, lng: 127.0788 },
  { name: '면목', lat: 37.5879, lng: 127.0820 },
  { name: '사가정', lat: 37.5879, lng: 127.0788 },
  { name: '용마산', lat: 37.5820, lng: 127.0788 },
  { name: '중곡', lat: 37.5753, lng: 127.0788 },
  { name: '군자(7)', lat: 37.5583, lng: 127.0788 },
  { name: '어린이대공원', lat: 37.5497, lng: 127.0788 },
  { name: '건대입구(7)', lat: 37.5402, lng: 127.0699 },
  { name: '뚝섬유원지', lat: 37.5311, lng: 127.0658 },
  { name: '청담', lat: 37.5218, lng: 127.0540 },
  { name: '강남구청', lat: 37.5178, lng: 127.0432 },
  { name: '학동', lat: 37.5151, lng: 127.0280 },
  { name: '논현', lat: 37.5151, lng: 127.0199 },
  { name: '반포', lat: 37.5047, lng: 127.0059 },
  { name: '고속터미널(7)', lat: 37.5047, lng: 127.0059 },
  { name: '내방', lat: 37.4939, lng: 126.9981 },
  { name: '이수(7)', lat: 37.4873, lng: 126.9818 },
  { name: '남성', lat: 37.4836, lng: 126.9718 },
  { name: '숭실대입구', lat: 37.4939, lng: 126.9598 },
  { name: '상도', lat: 37.5003, lng: 126.9456 },
  { name: '장승배기', lat: 37.5047, lng: 126.9348 },
  { name: '신대방삼거리', lat: 37.4939, lng: 126.9138 },
  { name: '보라매', lat: 37.4939, lng: 126.9227 },
  { name: '신풍', lat: 37.5047, lng: 126.9015 },
  { name: '대림(7)', lat: 37.4939, lng: 126.8951 },
  { name: '가산디지털단지(7)', lat: 37.4813, lng: 126.8822 },
  { name: '철산', lat: 37.4759, lng: 126.8609 },
  { name: '광명사거리', lat: 37.4759, lng: 126.8484 },
  { name: '천왕', lat: 37.4813, lng: 126.8238 },
  { name: '온수(7)', lat: 37.4989, lng: 126.8255 },
  { name: '부천종합운동장', lat: 37.5047, lng: 126.7869 },
  { name: '춘의', lat: 37.5097, lng: 126.7797 },
  { name: '부천시청', lat: 37.5097, lng: 126.7647 },

  // Line 8
  { name: '암사', lat: 37.5497, lng: 127.1328 },
  { name: '천호(8)', lat: 37.5395, lng: 127.1245 },
  { name: '강동구청', lat: 37.5311, lng: 127.1245 },
  { name: '몽촌토성', lat: 37.5151, lng: 127.1159 },
  { name: '잠실(8)', lat: 37.5133, lng: 127.1000 },
  { name: '석촌', lat: 37.5047, lng: 127.1004 },
  { name: '송파', lat: 37.5047, lng: 127.1159 },
  { name: '가락시장', lat: 37.4939, lng: 127.1159 },
  { name: '문정', lat: 37.4873, lng: 127.1245 },
  { name: '장지', lat: 37.4813, lng: 127.1245 },
  { name: '복정(8)', lat: 37.4817, lng: 127.1245 },
  { name: '산성', lat: 37.4759, lng: 127.1416 },
  { name: '남한산성입구', lat: 37.4604, lng: 127.1546 },
  { name: '단대오거리', lat: 37.4345, lng: 127.1328 },
  { name: '신흥', lat: 37.4245, lng: 127.1328 },
  { name: '수진', lat: 37.4190, lng: 127.1328 },
  { name: '모란', lat: 37.4190, lng: 127.1416 },

  // Line 9
  { name: '개화', lat: 37.5699, lng: 126.8013 },
  { name: '김포공항(9)', lat: 37.5699, lng: 126.8013 },
  { name: '공항시장', lat: 37.5583, lng: 126.8126 },
  { name: '신방화', lat: 37.5553, lng: 126.8238 },
  { name: '마곡나루', lat: 37.5571, lng: 126.8347 },
  { name: '양천향교', lat: 37.5265, lng: 126.8609 },
  { name: '가양', lat: 37.5611, lng: 126.8609 },
  { name: '증미', lat: 37.5553, lng: 126.8731 },
  { name: '등촌', lat: 37.5497, lng: 126.8832 },
  { name: '염창', lat: 37.5440, lng: 126.8832 },
  { name: '신목동', lat: 37.5261, lng: 126.8832 },
  { name: '선유도', lat: 37.5261, lng: 126.8963 },
  { name: '당산(9)', lat: 37.5344, lng: 126.9015 },
  { name: '국회의사당', lat: 37.5261, lng: 126.9138 },
  { name: '여의도(9)', lat: 37.5218, lng: 126.9227 },
  { name: '샛강', lat: 37.5151, lng: 126.9293 },
  { name: '노량진(9)', lat: 37.5143, lng: 126.9427 },
  { name: '노들', lat: 37.5097, lng: 126.9521 },
  { name: '흑석', lat: 37.5047, lng: 126.9640 },
  { name: '동작(9)', lat: 37.5097, lng: 126.9789 },
  { name: '구반포', lat: 37.5047, lng: 126.9872 },
  { name: '신반포', lat: 37.5003, lng: 126.9981 },
  { name: '고속터미널(9)', lat: 37.5047, lng: 127.0059 },
  { name: '사평', lat: 37.5003, lng: 127.0199 },
  { name: '신논현', lat: 37.5047, lng: 127.0251 },
  { name: '언주', lat: 37.5003, lng: 127.0346 },
  { name: '선정릉', lat: 37.5047, lng: 127.0485 },
  { name: '삼성중앙', lat: 37.5088, lng: 127.0540 },
  { name: '봉은사', lat: 37.5151, lng: 127.0540 },
  { name: '종합운동장(9)', lat: 37.5102, lng: 127.0732 },
  { name: '삼전', lat: 37.5047, lng: 127.0788 },
  { name: '석촌고분', lat: 37.5047, lng: 127.0892 },
  { name: '석촌(9)', lat: 37.5047, lng: 127.1004 },
  { name: '송파나루', lat: 37.5097, lng: 127.1159 },
  { name: '한성백제', lat: 37.5151, lng: 127.1245 },
  { name: '올림픽공원(9)', lat: 37.5097, lng: 127.1159 },
  { name: '둔촌오륜', lat: 37.5047, lng: 127.1328 },
  { name: '중앙보훈병원', lat: 37.5003, lng: 127.1546 },

  // Bundang line
  { name: '수서', lat: 37.4878, lng: 127.1004 },
  { name: '복정(분당)', lat: 37.4817, lng: 127.1245 },
  { name: '가천대', lat: 37.4506, lng: 127.1245 },
  { name: '태평', lat: 37.4345, lng: 127.1416 },
  { name: '모란(분당)', lat: 37.4190, lng: 127.1416 },
  { name: '야탑', lat: 37.4106, lng: 127.1248 },
  { name: '이매', lat: 37.3908, lng: 127.1248 },
  { name: '서현', lat: 37.3837, lng: 127.1159 },
  { name: '수내', lat: 37.3744, lng: 127.1004 },
  { name: '정자', lat: 37.3597, lng: 127.1115 },
  { name: '미금', lat: 37.3597, lng: 127.1004 },
  { name: '오리', lat: 37.3290, lng: 127.0892 },
  { name: '죽전', lat: 37.3179, lng: 127.1004 },
  { name: '보정', lat: 37.2884, lng: 127.1115 },
  { name: '구성', lat: 37.2663, lng: 127.1245 },
  { name: '신갈', lat: 37.2537, lng: 127.0892 },
  { name: '기흥', lat: 37.2416, lng: 127.1004 },

  // Airport line (AREX)
  { name: '공항화물청사', lat: 37.4761, lng: 126.5048 },
  { name: '인천공항2터미널', lat: 37.4604, lng: 126.4418 },
  { name: '인천공항1터미널', lat: 37.4479, lng: 126.4502 },
  { name: '운서', lat: 37.4759, lng: 126.5048 },
  { name: '청라국제도시', lat: 37.5218, lng: 126.6218 },
  { name: '영종', lat: 37.5003, lng: 126.5048 },
  { name: '검암', lat: 37.5497, lng: 126.6765 },
  { name: '계양', lat: 37.5553, lng: 126.7388 },
  { name: '김포공항(공항)', lat: 37.5699, lng: 126.8013 },
  { name: '디지털미디어시티(공항)', lat: 37.5783, lng: 126.8963 },
  { name: '홍대입구(공항)', lat: 37.5571, lng: 126.9227 },
  { name: '공덕(공항)', lat: 37.5440, lng: 126.9521 },
  { name: '서울역(공항)', lat: 37.5547, lng: 126.9707 },

  // Sinbundang (Shin-bundang)
  { name: '강남(신분당)', lat: 37.4979, lng: 127.0280 },
  { name: '양재(신분당)', lat: 37.4836, lng: 127.0362 },
  { name: '양재시민의숲', lat: 37.4604, lng: 127.0362 },
  { name: '청계산입구', lat: 37.4290, lng: 127.0540 },
  { name: '판교', lat: 37.3908, lng: 127.1115 },
  { name: '정자(신분당)', lat: 37.3597, lng: 127.1115 },
  { name: '미금(신분당)', lat: 37.3597, lng: 127.1004 },
  { name: '동천', lat: 37.3345, lng: 127.1115 },
  { name: '수지구청', lat: 37.3179, lng: 127.0892 },
  { name: '성복', lat: 37.3002, lng: 127.0892 },
  { name: '상현', lat: 37.2884, lng: 127.0540 },
  { name: '광교중앙', lat: 37.2884, lng: 127.0199 },
  { name: '광교(경기대)', lat: 37.2816, lng: 127.0251 },
];

/**
 * Fuzzy autocomplete: returns top matches for a given query string.
 * Uses Jaro-Winkler similarity for ranking.
 * @param {string} query
 * @param {number} [limit=8]
 * @returns {Array<{name:string, lat:number, lng:number, score:number}>}
 */
function subwayAutocomplete(query, limit = 8) {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim();

  const scored = SUBWAY_STATIONS.map((s) => ({
    ...s,
    score: similarityScore(s.name, q),
  }));

  // Filter and sort
  return scored
    .filter((s) => s.score > 0.3 || s.name.includes(q))
    .sort((a, b) => {
      // Exact includes match first
      const aIncludes = a.name.includes(q) ? 1 : 0;
      const bIncludes = b.name.includes(q) ? 1 : 0;
      if (bIncludes !== aIncludes) return bIncludes - aIncludes;
      return b.score - a.score;
    })
    .slice(0, limit);
}

/**
 * Simple similarity: combines startsWith, includes, and Jaro-Winkler.
 */
function similarityScore(str, query) {
  const s = str.replace(/\([^)]*\)/g, '').trim(); // strip line annotations
  if (s === query) return 1;
  if (s.startsWith(query)) return 0.95;
  if (s.includes(query)) return 0.85;
  return jaroWinkler(s, query);
}

function jaroWinkler(s1, s2) {
  if (s1 === s2) return 1;
  const jaro = jaroSimilarity(s1, s2);
  const prefix = commonPrefixLength(s1, s2, 4);
  return jaro + prefix * 0.1 * (1 - jaro);
}

function jaroSimilarity(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  const matchDist = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDist);
    const end = Math.min(i + matchDist + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  return (
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3
  );
}

function commonPrefixLength(s1, s2, maxLen) {
  let n = 0;
  while (n < maxLen && n < s1.length && n < s2.length && s1[n] === s2[n]) n++;
  return n;
}
