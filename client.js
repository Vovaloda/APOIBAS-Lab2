const axios = require('axios');

const serverUrl = 'http://localhost:3000';

axios.get(`${serverUrl}/publicKey`)
  .then((response) => {
    const publicKey = response.data;

    // Сценарий 1: Подписать сообщение и передать на сервер для верификации
    const messageToSign1 = 'Hello, server!';

    axios.post(`${serverUrl}/signMessage`, {
      message: messageToSign1,
    })
      .then((response) => {
        const signature1 = response.data.signature;

        axios.post(`${serverUrl}/verifySignature`, {
          signedMessage: messageToSign1,
          signature: signature1,
          publicKey,
        })
          .then((response) => {
            console.log('Сценарий 1:');
            console.log(`Верификация: ${response.data.isValid ? 'Успешно' : 'Неуспешно'}`);
          })
          .catch((error) => {
            console.error('Ошибка при выполнении сценария 1:', error.message);
          });
      })
      .catch((error) => {
        console.error('Ошибка при подписании сообщения:', error.message);
      });

    // Сценарий 2: Получить случайное сообщение с сервера и верифицировать его подпись
    axios.get(`${serverUrl}/generateRandomMessage`)
      .then((response) => {
        const randomMessage = response.data.randomMessage.toString();

        axios.post(`${serverUrl}/signMessage`, {
          message: randomMessage,
        })
          .then((response) => {
            const signature2 = response.data.signature;

            axios.post(`${serverUrl}/verifyRandomMessageSignature`, {
              message: randomMessage,
              signature: signature2,
              publicKey,
            })
              .then((response) => {
                console.log('Сценарий 2:');
                console.log(`Верификация: ${response.data.isValid ? 'Успешно' : 'Неуспешно'}`);
              })
              .catch((error) => {
                console.error('Ошибка при выполнении сценария 2:', error.message);
              });
          })
          .catch((error) => {
            console.error('Ошибка при подписании случайного сообщения:', error.message);
          });
      })
      .catch((error) => {
        console.error('Ошибка при получении случайного сообщения:', error.message);
      });
  })
  .catch((error) => {
    console.error('Ошибка при получении публичного ключа:', error.message);
  });
