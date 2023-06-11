using System.ComponentModel.DataAnnotations.Schema;

namespace Server.Models;

public enum EventAttendanceStatus
{
  Pending,
  Approved,
  Declined
}

public class UserEvent
{
  [ForeignKey(nameof(User))]
  public int UserId { get; set; }
  public User? User { get; set; }

  [ForeignKey(nameof(Event))]
  public int EventId { get; set; }
  public Event? Event { get; set; }

  public EventAttendanceStatus Status { get; set; } = EventAttendanceStatus.Pending;
}