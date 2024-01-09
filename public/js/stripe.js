/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51NfbT3SECDZ6cxBj4WSJpnD3HFUlSUdEvGRtw1dIkgT7mGxesChYqyEWiMlkIWxzsAoQVzvhLiSHiZW3ZVchbhEF009B69lMoK'
);

export const bookTour = async (tourId) => {
  try {
    // 1)  get checkout session from API
    const session = await axios({
      method: 'GET',
      url: `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log('--------------------------', session);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};

// /* eslint-disable */

// import axios from 'axios';
// import { showAlert } from './alerts';
// import keys from '../../config/keys';

// const stripe = Stripe(keys.stripeKey);

// export const bookTour = async tourId => {
//   try {
//     // 1) Get checkout session from API
//     const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
//     // console.log(session);

//     // 2) Create checkout form + charge credit card
//     await stripe.redirectToCheckout({
//       sessionId: session.data.session.id
//     });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };
