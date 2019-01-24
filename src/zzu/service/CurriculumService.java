package zzu.service;

import zzu.domin.Curriculum;

import java.sql.SQLException;
import java.util.List;

public interface CurriculumService {
    List<Curriculum> findAll() throws SQLException;

    //查询学生选课信息
    List<Curriculum> findStuCur(Integer studentId) throws SQLException;


}
