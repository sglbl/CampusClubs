using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using server.Constants;
using Server.Data;
using Server.Models;

namespace server.Controllers;

[ApiController]
[Route(Consts.DEFAULT_ROUTE)]
public class UserController : ControllerBase
{
  private readonly ApplicationDbContext _db; // create object of ApplicationDbContext class

  public UserController(ApplicationDbContext db) // constructor
  {
    _db = db;
  }

  [HttpGet]
  public IActionResult GetAll()
  {   // Return all user info
    try
    {
      IEnumerable<User> userList = _db.User;
      return Ok(new ApiResponse(true, "User request is successful", userList));
    }
    catch (Exception e)
    {
      return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse(false, "User request is unsuccessful", e.Message));
    }
  }

  [HttpGet("{userId}")]
  public IActionResult GetUserInfoById(int userId)
  {
    /*** returns all info ***/
    User? user = _db.User.SingleOrDefault(u => u.userId == userId);

    List<Club> clubs = new List<Club>();
    using (SqlConnection connection = (SqlConnection)_db.Database.GetDbConnection())
    {
      string query = "SELECT c.* FROM Club c INNER JOIN ClubMembers cm ON c.clubId = cm.clubId INNER JOIN [User] u ON u.userId = cm.userId WHERE u.userId = @userId";
      SqlCommand command = new SqlCommand(query, connection);
      command.Parameters.AddWithValue("@userId", userId);

      connection.Open();
      SqlDataReader reader = command.ExecuteReader();

      while (reader.Read())
      {
        Club club = new Club
        {
          clubId = reader.GetInt32(0),
          slug = reader.GetString(1),
          name = reader.GetString(2),
          description = reader.GetString(3),
          image = reader.GetString(4),
          validFrom = reader.IsDBNull(5) ? null : reader.GetDateTime(5),
          validUntil = reader.IsDBNull(6) ? null : reader.GetDateTime(6)
        };
        clubs.Add(club);
      }
      reader.Close();
    }


    if (user != null)
    {
      user.clubsRegistered = clubs;
      return Ok(new ApiResponse(true, "User request is successfull", user));
    }

    return NotFound(new ApiResponse(false, "User request is unsuccessful since user couldn't be found", null));
  }

  [HttpGet("username")]
  public IActionResult GetUserByUserName(string username)
  {
    /*** returns all info ***/
    User? user = _db.User.SingleOrDefault(u => u.UserName == username);

    if (user != null)
    {
      return Ok(new ApiResponse(true, "User request is successful", user));
    }

    return NotFound(new ApiResponse(false, "User not found", null));
  }

  [HttpPost]
  public IActionResult Create(User user)
  {
    try
    {
      // Get the underlying SqlConnection object
      SqlConnection sqlConnection = (SqlConnection)_db.Database.GetDbConnection();

      var sql = "INSERT INTO User (userId, username, firstName, lastName, email, image, createdDate, deletedDate) VALUES (@Id, @UserName, @firstName, @lastName, @Email, @Image, @CreatedDate, @DeletedDate)";
      var cmd = new SqlCommand(sql, sqlConnection);
      cmd.Parameters.AddWithValue("@Id", user.userId);
      cmd.Parameters.AddWithValue("@UserName", user.UserName);
      cmd.Parameters.AddWithValue("@firstName", user.firstName);
      cmd.Parameters.AddWithValue("@lastName", user.lastName);
      cmd.Parameters.AddWithValue("@Email", user.Email);
      cmd.Parameters.AddWithValue("@Image", user.image);
      cmd.Parameters.AddWithValue("@CreatedDate", user.CreatedDate ?? (object)DBNull.Value);
      cmd.Parameters.AddWithValue("@DeletedDate", user.DeletedDate ?? (object)DBNull.Value);
      /* ?? (object)DBNull.Value makes allow nulls by converting DBNull */

      sqlConnection.Open();
      int rowsAffected = cmd.ExecuteNonQuery();
      sqlConnection.Close();

      if (rowsAffected > 0)
      {
        return Ok(new ApiResponse(true, "User created successfully.", user));
      }
      else
      {
        return BadRequest(new ApiResponse(false, "BadRequest: Unable to create the user.", null));
      }
    }
    catch (Exception e)
    {
      return StatusCode(StatusCodes.Status500InternalServerError, new ApiResponse(false, "Unable to create the user. Duplicate user info are not allowed.", e.Message));
    }
  }

  [HttpDelete("userId")]
  public IActionResult DeleteWithId(int userId)
  {
    // Get the underlying SqlConnection object
    SqlConnection sqlConnection = (SqlConnection)_db.Database.GetDbConnection();
    User? user = _db.User.FirstOrDefault(u => u.userId == userId);
    var sql = "DELETE FROM User WHERE userId = @Id";
    var cmd = new SqlCommand(sql, sqlConnection);
    cmd.Parameters.AddWithValue("@Id", userId);

    sqlConnection.Open();
    int rowsAffected = cmd.ExecuteNonQuery();
    sqlConnection.Close();

    if (rowsAffected > 0)
    {
      return Ok(new ApiResponse(true, "User deleted successfully.", user));
    }
    else
    {
      return NotFound(new ApiResponse(false, "User not found.", null));
    }
  }

  [HttpPut("userId")]
  public IActionResult Update(int userId, User updatedUser)
  {
    // Get the underlying SqlConnection object
    SqlConnection sqlConnection = (SqlConnection)_db.Database.GetDbConnection();

    var sql = "UPDATE User SET username = @UserName, firstName = @firstName, lastName = @lastName, email = @Email, image = @Image, createdDate = @CreatedDate, deletedDate = @DeletedDate WHERE userId = @Id";
    var cmd = new SqlCommand(sql, sqlConnection);
    cmd.Parameters.AddWithValue("@Id", userId);
    cmd.Parameters.AddWithValue("@UserName", updatedUser.UserName);
    cmd.Parameters.AddWithValue("@firstName", updatedUser.firstName);
    cmd.Parameters.AddWithValue("@lastName", updatedUser.lastName);
    cmd.Parameters.AddWithValue("@Email", updatedUser.Email);
    cmd.Parameters.AddWithValue("@Image", updatedUser.image);
    cmd.Parameters.AddWithValue("@CreatedDate", updatedUser.CreatedDate ?? (object)DBNull.Value);
    cmd.Parameters.AddWithValue("@DeletedDate", updatedUser.DeletedDate ?? (object)DBNull.Value);

    sqlConnection.Open();
    int rowsAffected = cmd.ExecuteNonQuery();
    sqlConnection.Close();

    if (rowsAffected > 0)
    {
      return Ok(new ApiResponse(true, "User request is successful", updatedUser));
    }
    else
    {
      return NotFound(new ApiResponse(false, "User not found.", null));
    }
  }


}
