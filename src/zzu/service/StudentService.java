package zzu.service;

import zzu.domin.Student;

import java.sql.SQLException;

public interface StudentService {
    Student findOneStudent(Integer studentId, String passWord) throws SQLException;
}
