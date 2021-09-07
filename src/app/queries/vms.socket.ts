import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useMockableQuery, useMockableMutation, getInventoryApiUrl } from './helpers';
import { authorizedFetch, useAuthorizedFetch, useFetchContext } from './fetchHelpers';

export const openVmsConnection = (url: string) => {

}

// const vmsSocket = useVmsSocketMutation('vms?detail=1');

// vmsSocket.mutate({
//   foo: 'bar'
// });

// export const useVmsSocketMutation = (
//   url: string,
//   onSuccess?: () => void,
//   onError?: () => void
// ) => {
//   console.log('prepped for vms.socket');
//   // const queryClient = useQueryClient();
//   const fetchContext = useFetchContext();

//   const result = useMockableMutation<any>(
//     async (options: any) => {
//       // await authorizedFetch(
//       //   getMustGatherApiUrl(url),
//       //   fetchContext,
//       //   { 'Content-Type': 'application/json' },
//       //   'post',
//       //   options
//       // )

//       return new Promise((res, rej) => {
//         console.log('called vms.socket promise');
//         authorizedFetch<any>(
//           getInventoryApiUrl(url),
//           fetchContext,
//           { 'X-Watch': '' },
//           // 'post'
//         )
//           .then((wsData) => {
//             console.log('wsData', wsData);
//             res(wsData);
//           })
//           .catch((error) => {
//             console.log('wsError', error);
//             rej({
//               result: 'error',
//               error: error,
//             });
//           });
//       });
//     },
//     {
//       onSuccess: (data) => {
//         // queryClient.invalidateQueries(['must-gather-list']);
//         onSuccess && onSuccess();
//       },
//       onError: () => {
//         onError && onError();
//       },
//     }
//   );
//   return result;
// };



// export const useTestSubscription = () => {
//   React.useEffect(() => {
//     console.log('websocket useEffect ran');

//     const websocket = new WebSocket('ws://echo.websocket.org/');
//     console.log('websocket', websocket);

//     websocket.onopen = () => {
//       console.log('connected')
//     }

//     return () => {
//       websocket.close()
//     }
//   }, [])
// }
