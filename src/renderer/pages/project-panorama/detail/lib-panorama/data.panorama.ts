// import { PanoramaDataType } from './panorama.type';
// import { btnHotSpot } from './toolbar/new-hotspot/html';

// export const PANORAMA: PanoramaDataType[] = [
//   {
//     id: 1,
//     title: 'CAM 1',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 4.720283855981834, pitch: -0.0004923518129509308 },
//     subtitle: 'C1',
//     description: 'This is the C1 panorama',
//     image: 'C1.jpg',
//     thumbnail: '1.png',
//     markers: [
//       {
//         id: 'marker1-1',
//         zoomLvl: 90,
//         position: { yaw: 5.494087698427747, pitch: 0.07326137643616004 },
//         html: btnHotSpot("onMarkerClick(2, 'marker1-1')", 'CAM 2'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker1-2',
//         zoomLvl: 90,
//         position: { yaw: 4.858282555131558, pitch: 0.03813230189691175 },
//         html: btnHotSpot("onMarkerClick(10, 'marker1-2')", 'CAM 10'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: 'CAM 2',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 6.244647235441991, pitch: 0.01038732383850971 },
//     subtitle: 'C2',
//     description: 'This is the C2 panorama',
//     image: 'C2.jpg',
//     thumbnail: '2.png',
//     markers: [
//       {
//         id: 'marker2-1',
//         zoomLvl: 90,
//         position: { yaw: 2.2670984519022275, pitch: -0.10122053682879706 },
//         html: btnHotSpot("onMarkerClick(1, 'marker2-1')", 'CAM 1'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker2-2',
//         zoomLvl: 90,
//         position: { yaw: 6.059089547414841, pitch: -0.1286752370822215 },
//         html: btnHotSpot("onMarkerClick(3, 'marker2-2')", 'CAM 3'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker2-3',
//         zoomLvl: 90,
//         position: { yaw: 4.037171730802667, pitch: -0.10006422639753954 },
//         html: btnHotSpot("onMarkerClick(10, 'marker2-3')", 'CAM 10'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 3,
//     title: 'CAM 3',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 4.752445010979267, pitch: 0.0021444654755833348 },
//     subtitle: 'C3',
//     description: 'This is the C3 panorama',
//     image: 'C3.jpg',
//     thumbnail: '3.png',
//     markers: [
//       {
//         id: 'marker3-1',
//         zoomLvl: 90,
//         position: { yaw: 4.715501097641834, pitch: -0.10698413980146015 },
//         html: btnHotSpot("onMarkerClick(5, 'marker3-1')", 'CAM 5'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker3-2',
//         zoomLvl: 90,
//         position: { yaw: 3.03026568386066, pitch: -0.13528555201784687 },
//         html: btnHotSpot("onMarkerClick(2, 'marker3-2')", 'CAM 2'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 4,
//     title: 'CAM 4',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 2.330273633133579, pitch: -0.004474704358785386 },
//     subtitle: 'C4',
//     description: 'This is the C4 panorama',
//     image: 'C4.jpg',
//     thumbnail: '4.png',
//     markers: [
//       {
//         id: 'marker4-1',
//         zoomLvl: 90,
//         position: { yaw: 2.4168756453963245, pitch: -0.0025937304518834914 },
//         html: btnHotSpot("onMarkerClick(3, 'marker4-1')", 'CAM 3'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 5,
//     title: 'CAM 5',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 3.1343202477050345, pitch: -0.004882933758445285 },
//     subtitle: 'C5',
//     description: 'This is the C5 panorama',
//     image: 'C5.jpg',
//     thumbnail: '5.png',
//     markers: [
//       {
//         id: 'marker5-1',
//         zoomLvl: 90,
//         position: { yaw: 5.025953548082214, pitch: -0.0330173611823561 },
//         html: btnHotSpot("onMarkerClick(7, 'marker5-1')", 'CAM 7'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker5-2',
//         zoomLvl: 90,
//         position: { yaw: 4.682289062933634, pitch: -0.04846305756120306 },
//         html: btnHotSpot("onMarkerClick(8, 'marker5-2')", 'CAM 8'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker5-3',
//         zoomLvl: 90,
//         position: { yaw: 2.8578457469150536, pitch: -0.060360249985442094 },
//         html: btnHotSpot("onMarkerClick(6, 'marker5-3')", 'CAM 6'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker5-4',
//         zoomLvl: 90,
//         position: { yaw: 1.8492091275964628, pitch: -0.13292729741013543 },
//         html: btnHotSpot("onMarkerClick(3, 'marker5-4')", 'CAM 3'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 6,
//     title: 'CAM 6',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 2.65147004825163, pitch: -0.08315476599790439 },
//     subtitle: 'C6',
//     description: 'This is the C6 panorama',
//     image: 'C6.jpg',
//     thumbnail: '6.png',
//     markers: [
//       {
//         id: 'marker6-1',
//         zoomLvl: 90,
//         position: { yaw: 2.718019888466999, pitch: -0.1051257353102073 },
//         html: btnHotSpot("onMarkerClick(10, 'marker6-1')", 'CAM 10'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 7,
//     title: 'CAM 7',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 1.614041677005854, pitch: -0.03921270742942928 },
//     subtitle: 'C7',
//     description: 'This is the C7 panorama',
//     image: 'C7.jpg',
//     thumbnail: '7.png',
//     markers: [
//       {
//         id: 'marker7-1',
//         zoomLvl: 90,
//         position: { yaw: 2.116071705032633, pitch: -0.20707853057877124 },
//         html: btnHotSpot("onMarkerClick(5, 'marker7-1')", 'CAM 5'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 8,
//     title: 'CAM 8',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 3.1299539774693175, pitch: 0.006512814683198309 },
//     subtitle: 'C8',
//     description: 'This is the C8 panorama',
//     image: 'C8.jpg',
//     thumbnail: '8.png',
//     markers: [
//       {
//         id: 'marker8-1',
//         zoomLvl: 90,
//         position: { yaw: 3.083099103016977, pitch: -0.05718506106275134 },
//         html: btnHotSpot("onMarkerClick(12, 'marker8-1')", 'CAM 12'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 9,
//     title: 'CAM 9',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 3.845224342677454, pitch: -0.013248726297815816 },
//     subtitle: 'C9',
//     description: 'This is the C9 panorama',
//     image: 'C9.jpg',
//     thumbnail: '9.png',
//     markers: [
//       {
//         id: 'marker9-1',
//         zoomLvl: 90,
//         position: { yaw: 3.1478929105881566, pitch: -0.04125882603051734 },
//         html: btnHotSpot("onMarkerClick(12, 'marker9-1')", 'CAM 12'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
//   {
//     id: 10,
//     title: 'CAM 10',
//     pointPosition: { bottom: '50%', left: '50%' },
//     cameraPosition: { yaw: 3.5829762665141827, pitch: 0.007661243922078231 },
//     subtitle: 'C10',
//     description: 'This is the C10 panorama',
//     image: 'C10.jpg',
//     thumbnail: '10.png',
//     markers: [
//       {
//         id: 'marker10-1',
//         zoomLvl: 90,
//         position: { yaw: 4.821431258828649, pitch: -0.30726398637602337 },
//         html: btnHotSpot("onMarkerClick(11, 'marker10-1')", 'CAM 11'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//       {
//         id: 'marker10-2',
//         zoomLvl: 90,
//         position: { yaw: 1.6986638034382862, pitch: -0.15014619562820175 },
//         html: btnHotSpot("onMarkerClick(1, 'marker10-2')", 'CAM 1'),
//         style: { cursor: 'pointer', zIndex: '100' },
//       },
//     ],
//   },
// ];
