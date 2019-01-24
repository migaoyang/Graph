package zzu.service;

import zzu.dao.CollectDao;
import zzu.dao.CollectDaoImp;
import zzu.dao.StuCurDao;
import zzu.dao.StuCurDaoImp;
import zzu.domin.Curriculum;

import java.sql.SQLException;

public class CollectServiceImp implements CollectService {
    @Override
    public void saveNode(String nodeName, String nodeConcept,Double nodeWeight, Integer loginStudentID, Integer curriculumId) throws SQLException {
        CollectDao collectDao = new CollectDaoImp();
        collectDao.saveNode(nodeName, nodeConcept, nodeWeight, loginStudentID, curriculumId);
    }

    @Override
    public void addLine(String nodeA, String nodeB, Double weight, Integer loginStudentID, Integer curriculumId) throws SQLException {
        CollectDao collectDao = new CollectDaoImp();
        collectDao.addLine(nodeA,nodeB,weight,loginStudentID,curriculumId);
    }

    @Override
    public void clean(Integer loginStudentID) throws SQLException {
        CollectDao collectDao = new CollectDaoImp();
        //清理知识点表
        collectDao.cleanNode(loginStudentID);
        //清理知识点关联表
        collectDao.cleanLine(loginStudentID);

    }

    @Override
    public void updateStuCurMemo(Integer loginStudentID, Integer curriculumId, String memo) throws SQLException {
        CollectDao collectDao = new CollectDaoImp();
        collectDao.updateStuCurMemo(loginStudentID, curriculumId, memo);
    }

    @Override
    public Curriculum findMemo(Integer loginStudentID, Integer curriculumId) throws SQLException {
        StuCurDao stuCurDao = new StuCurDaoImp();
        return stuCurDao.findMemo(loginStudentID, curriculumId);
    }
}
