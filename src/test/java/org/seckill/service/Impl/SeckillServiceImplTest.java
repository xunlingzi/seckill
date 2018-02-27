package org.seckill.service.Impl;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.seckill.dto.Exposer;
import org.seckill.dto.SeckillExecution;
import org.seckill.entity.Seckill;
import org.seckill.exception.RepeatKillException;
import org.seckill.exception.SeckillCloseException;
import org.seckill.exception.SeckillException;
import org.seckill.service.SeckillService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.util.List;

import static org.junit.Assert.*;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration({
        "classpath:spring/spring-dao.xml",
        "classpath:spring/spring-service.xml"})
public class SeckillServiceImplTest {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private SeckillService seckillService;

    @Test
    public void getSeckillList() {
        List<Seckill> list = seckillService.getSeckillList();
        logger.info("list{}", list);
    }

    @Test
    public void getById() {
        long id = 1000;
        Seckill seckill = seckillService.getById(id);
        logger.info("seckill={}", seckill);

        //Exposer{exposed=true, md5='715785dab88d715119cf777ea9f3dabb', seckillId=1004, now=0, start=0, end=0}
    }

//    @Test
//    public void exportSeckillUrl() {
//        long id = 1004L;
//        Exposer exposer = seckillService.exportSeckillUrl(id);
//        logger.info("exposer={}", exposer);
//    }
//
//    @Test
//    public void executeSeckill() throws Exception{
//        long id = 1004;
//        long phone = 12366668888L;
//        String md5 = "715785dab88d715119cf777ea9f3dabb";
//        try {
//            SeckillExecution execution = seckillService.executeSeckill(id, phone, md5);
//            logger.info("result={}", execution);
//        } catch (RepeatKillException e) {
//            logger.error(e.getMessage());
//        } catch (SeckillCloseException e) {
//            logger.error(e.getMessage());
//        }
//    }

    //测试代码完整逻辑，注意可重复执行
    @Test
    public void testSeckillLogic() {
        long id = 1003L;
        Exposer exposer = seckillService.exportSeckillUrl(id);
        if (exposer.isExposed()) {
            logger.info("exposer={}", exposer);
            long phone = 12366668888L;
            String md5 = exposer.getMd5();
            try {
                SeckillExecution execution = seckillService.executeSeckill(id, phone, md5);
                logger.info("result={}", execution);
            } catch (RepeatKillException e1) {
                logger.error(e1.getMessage());
            } catch (SeckillCloseException e2) {
                logger.error(e2.getMessage());
            }
        }
        else {
            //秒杀未开启
            logger.warn("exposer={}", exposer);
        }
    }
}