import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { divider, heading, panel, text } from '@metamask/snaps-ui';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */

export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  const fetchNotifs = async () => {
    const address = await ethereum.request({ method: 'eth_requestAccounts' });
    const resp = await fetch(
      `https://backend-staging.epns.io/apis/v1/users/eip155:42:${address}/feeds?spam=true`,
    );

    return await resp.json();
  };

  switch (request.method) {
    case 'hello':
      return fetchNotifs().then((resp) => {
        /* Create a header and body for each notification */
        const sections = [];
        sections.push(heading('--- Notifications ---'));
        sections.push(divider());
        for (const feed of resp.feeds) {
          sections.push(heading(feed.payload.notification.title));
          sections.push(text(feed.payload.notification.body));
          sections.push(divider());
        }

        /* Display the panel containing all the notifications. */
        snap.request({
          method: 'snap_dialog',
          params: {
            type: 'Alert',
            content: panel(sections),
          },
        });
      });
    default:
      throw new Error('Method not found.');
  }
};
