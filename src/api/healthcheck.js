import props from '../../properties';

export default (router) => {
  router.get('/healthcheck', async(req, res, next) => {
    let healthy = true;
    const services = {
      schedules: 'UP'
    };

    if (!props.schedule.enable) {
      healthy = false;
      services.schedules = 'DOWN';
    }

    if (!healthy) {
      res.status(500).json({ status: 'DOWN', services });
      return;
    }
    res.send({ status: 'UP', services });
  });
  return router;
};
